# 1. Contextualización de la base de datos

## El problema que resuelve

SignBridge traduce entre **texto, voz y Lengua de Señas Colombiana (LSC)** para reducir las barreras de comunicación entre personas sordas y oyentes. La base de datos guarda:

- **Quién usa el sistema** y con qué rol (Cliente, Soporte, Administrador).
- **El vocabulario LSC**: cada palabra o frase con la ruta de su video.
- **Lo que pasa en cada traducción**: la sesión, si entró por texto, voz o seña, y qué palabras se usaron y en qué orden.
- **La relación con el usuario**: favoritos, valoraciones por palabra, tickets de soporte, notificaciones y mensajes.
- **Trazabilidad**: accesos y errores del sistema.

## Motor y convenciones

| Decisión | Valor | Por qué |
|---|---|---|
| Motor | PostgreSQL 17 | Triggers en PL/pgSQL, vistas y `gen_random_uuid()` |
| Llaves primarias | UUID en texto (`CHAR(36)`) | No exponen cuántos registros hay y se pueden generar en el cliente |
| Nombres de tablas | `PascalCase` entre comillas (`"User"`) | Coinciden con los modelos de SQLAlchemy |
| Auditoría | `created_at`, `updated_at`, `deleted_at` | `updated_at` lo mantiene el trigger `fn_set_updated_at` |
| Borrado | **Lógico** (`deleted_at IS NOT NULL`) | No se pierde el historial de traducciones ni valoraciones |

## Tablas por módulo

| Módulo | Tablas | Para qué |
|---|---|---|
| Usuarios y seguridad | `User`, `Role`, `Region`, `AccessLog` | Registro, login, rol y ciudad. Un trigger asigna la región según la ciudad |
| Vocabulario | `LexicalUnit` | Palabras y frases LSC con su `video_url` |
| Traducción | `TranslationSession`, `TranslationDetail`, `VoiceInput`, `SignInput` | Una sesión por traducción y el detalle palabra por palabra |
| Interacción | `FavoriteWords`, `Feedback`, `Notification`, `Message` | Favoritos, calificación 1–5 por palabra, avisos in-app y mensajes |
| Soporte | `Support` | Tickets con estado y solución |
| Configuración | `DeviceConfiguration`, `SignAvatarConfig` | Preferencias por usuario (una fila por usuario) |
| Diagnóstico | `SystemErrorLog` | Errores capturados por el backend |

## Lógica dentro de la base

| Objeto | Tipo | Qué hace |
|---|---|---|
| `fn_set_updated_at` | Función + 14 triggers | Actualiza `updated_at` en cada `UPDATE` |
| `fn_assign_region_by_city` | Función + trigger en `User` | Si el usuario trae ciudad y no región, busca la región por nombre |
| `chk_feedback_rating` | CHECK | La calificación va de 1 a 5 |
| `chk_message_no_self_send` | CHECK | Nadie se manda mensajes a sí mismo |
| `vw_users`, `vw_user_dashboard`, `vw_admin_dashboard`, `vw_system_statistics` | Vistas | Alimentan los paneles de usuario y de administración |

## Observaciones para el equipo

Estas cosas salieron al revisar el respaldo. No se cambiaron aquí: cada una merece su propia rama y su PR.

1. **Relaciones sin llave foránea.** `User.id_role`, `TranslationSession.id_user`, `Feedback.id_user`, `FavoriteWords.id_user`, `Support.id_user` y otras guardan el id, pero la base no lo valida con `FOREIGN KEY`. En el diagrama se ven como línea punteada.
2. **Palabras duplicadas en `LexicalUnit`**, como `Adiós`/`adios` y `Buenos Dias`/`buenos dias`. Algunas no tienen video. Conviene normalizarlas y poner un `UNIQUE` sobre el texto en minúscula.
3. **`Message` e `id_lexicalunit` en `Feedback`** usan `VARCHAR` en lugar de `CHAR(36)`, distinto al resto de llaves.

## Lo que NO se versiona

El respaldo completo (`pg_dump`) tiene correos, teléfonos y hashes de contraseñas de personas reales, así que **no se sube a GitHub**. En el repo solo van la estructura ([DDL](03-scripts-ddl.sql)) y los catálogos con usuarios demo ([DML](04-scripts-dml.sql)).
