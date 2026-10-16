from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import uuid

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_reset_token,
    decode_token, get_current_user,
)
from app.models.user import User, Role
from app.schemas.auth import (
    UserRegister, UserLogin, TokenResponse,
    ForgotPasswordRequest, ResetPasswordRequest, UserProfile,
)
from app.services.mail import send_reset_email, send_welcome_email

router = APIRouter(prefix="/auth", tags=["Autenticación"])


# ── Registro ──────────────────────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    # Asignar rol 'usuario' / 'Cliente' por defecto
    default_role = (
        db.query(Role)
        .filter(Role.role_name.in_(["usuario", "Cliente", "cliente"]))
        .first()
    )
    if not default_role:
        raise HTTPException(status_code=500, detail="Rol por defecto no encontrado en BD")

    new_user = User(
        id_user       = str(uuid.uuid4()),
        id_role       = default_role.id_role,
        id_region     = payload.id_region,
        first_name    = payload.first_name,
        middle_name   = payload.middle_name,
        last_name     = payload.last_name,
        second_last_name = payload.second_last_name,
        phone         = payload.phone,
        address       = payload.address,
        city          = payload.city,
        email         = payload.email,
        password_hash = hash_password(payload.password),
    )
    db.add(new_user)

    # Log de acceso
    from app.models.session import AccessLog
    db.add(AccessLog(
        id_log      = str(uuid.uuid4()),
        id_user     = new_user.id_user,
        access_type = "login",
    ))

    db.commit()

    # Correo de bienvenida — en background: antes se esperaba (await) el
    # envío completo del correo dentro del propio request, así que /register
    # tardaba lo que tardara el handshake con el servidor SMTP. Con
    # BackgroundTasks la respuesta sale apenas se crea el usuario, y el
    # correo se envía después sin que el usuario tenga que esperarlo.
    background_tasks.add_task(_enviar_bienvenida_en_segundo_plano, new_user.email, new_user.first_name)

    return {"message": "Usuario registrado exitosamente", "user_id": new_user.id_user}


async def _enviar_bienvenida_en_segundo_plano(email: str, first_name: str) -> None:
    """Envoltorio para que una falla de SMTP en segundo plano solo quede en el log."""
    try:
        await send_welcome_email(email, first_name)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("No se pudo enviar correo de bienvenida: %s", exc)


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == payload.email,
        User.deleted_at.is_(None),
    ).first()

    from app.models.session import AccessLog

    if not user or not verify_password(payload.password, user.password_hash):
        # Log intento fallido
        if user:
            db.add(AccessLog(
                id_log      = str(uuid.uuid4()),
                id_user     = user.id_user,
                access_type = "failed_attempt",
            ))
            db.commit()
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # Cuenta desactivada por un administrador
    if not user.is_active:
        db.add(AccessLog(
            id_log      = str(uuid.uuid4()),
            id_user     = user.id_user,
            access_type = "blocked_attempt",
        ))
        db.commit()
        raise HTTPException(
            status_code=403,
            detail="Tu cuenta ha sido desactivada. Contacta al administrador.",
        )

    # Log de acceso exitoso
    db.add(AccessLog(
        id_log      = str(uuid.uuid4()),
        id_user     = user.id_user,
        access_type = "login",
    ))
    db.commit()

    token = create_access_token({"sub": user.id_user})
    full_name = f"{user.first_name} {user.last_name}"

    return TokenResponse(
        access_token = token,
        user_id      = user.id_user,
        role         = user.role.role_name,
        full_name    = full_name,
    )


# ── Perfil del usuario autenticado ────────────────────────────────────────────

@router.get("/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserProfile(
        id_user   = current_user.id_user,
        full_name = f"{current_user.first_name} {current_user.last_name}",
        email     = current_user.email,
        role      = current_user.role.role_name,
        region    = current_user.region.region_name if current_user.region else None,
        phone     = current_user.phone,
        city      = current_user.city,
    )


# ── Recuperación de contraseña ────────────────────────────────────────────────

@router.post("/forgot-password", status_code=200)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == payload.email,
        User.deleted_at.is_(None),
    ).first()

    if user:
        token = create_reset_token(user.email)
        # En background — era la causa de la demora al recuperar contraseña:
        # el endpoint esperaba (await) el envío completo del correo antes de
        # responder, así que la lentitud del handshake SMTP se sentía como
        # lentitud de la app. La respuesta ya no depende de eso.
        background_tasks.add_task(_enviar_reset_en_segundo_plano, user.email, token)

    return {"message": "Si el correo existe, recibirás un enlace para restablecer tu contraseña"}


async def _enviar_reset_en_segundo_plano(email: str, token: str) -> None:
    """Envoltorio para que una falla de SMTP en segundo plano solo quede en el log."""
    try:
        await send_reset_email(email, token)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("No se pudo enviar correo de recuperación: %s", exc)

@router.post("/reset-password", status_code=200)
async def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload_data = decode_token(payload.token)

    if payload_data.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Token inválido")

    email = payload_data.get("sub")
    user  = db.query(User).filter(User.email == email, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {
        "message": "¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión con tu nueva contraseña.",
        "redirect": "/login",
    }
    # ── Autoeliminación de cuenta (HU-21) ─────────────────────────────────────────

from pydantic import BaseModel


class DeleteAccountRequest(BaseModel):
    password: str


@router.delete("/me", status_code=200)
async def delete_my_account(
    payload: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Elimina (soft-delete) la cuenta del usuario autenticado.

    Se exige la contraseña actual como confirmación — evita que la cuenta se
    borre por error con la sesión abierta en un dispositivo compartido.
    No se borra la fila físicamente, igual que el resto del sistema
    (palabras, sesiones, tickets): solo se marca `deleted_at` y se
    desactiva (`is_active = False`), de modo que el login vuelva a
    rechazarla de inmediato.
    """
    if not verify_password(payload.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    from datetime import datetime, timezone

    current_user.deleted_at = datetime.now(timezone.utc)
    current_user.is_active = False
    db.commit()

    return {"message": "Tu cuenta ha sido eliminada."}