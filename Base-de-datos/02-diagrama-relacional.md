# 2. Diagrama relacional

GitHub dibuja este diagrama automáticamente (Mermaid). Para editarlo, cambia el bloque de código y el render se actualiza solo.

**Cómo leer las líneas:**

- **Línea continua** (`--`): la relación existe en la base como `FOREIGN KEY`.
- **Línea punteada** (`..`): la columna guarda el id, pero la base **no** la valida. Ver la observación 1 de la [contextualización](01-contextualizacion.md).

Para no ensuciar el dibujo se omiten `created_at`, `updated_at` y `deleted_at`, que tienen todas las tablas menos `Role` y `Message`.

```mermaid
erDiagram
    Region             ||--o{ User               : "fk_user_region"
    User               ||--o{ Message            : "envía"
    User               ||--o{ Message            : "recibe"
    User               ||--o{ Notification       : "recibe"
    LexicalUnit        ||--o{ Feedback           : "se califica en"
    TranslationSession ||--o{ TranslationDetail  : "tiene"
    TranslationSession ||--o{ VoiceInput         : "entra por voz"
    TranslationSession ||--o{ SignInput          : "entra por seña"

    Role               ||..o{ User               : "asigna"
    User               ||..o{ AccessLog          : "registra"
    User               ||..o{ TranslationSession : "inicia"
    User               ||..o{ FavoriteWords      : "guarda"
    User               ||..o{ Feedback           : "escribe"
    User               ||..o{ Support            : "abre"
    User               ||..o| DeviceConfiguration: "configura"
    User               ||..o| SignAvatarConfig   : "personaliza"
    LexicalUnit        ||..o{ FavoriteWords      : "es favorita en"
    LexicalUnit        ||..o{ TranslationDetail  : "aparece en"
    TranslationSession ||..o{ Feedback           : "se califica en"

    AccessLog {
        char36 id_log PK
        char36 id_user FK
        timestamp date_time
        varchar access_type
    }
    DeviceConfiguration {
        char36 id_config PK
        char36 id_user FK
        boolean offline_usage
        varchar android_version
        varchar screen_size
    }
    FavoriteWords {
        char36 id_favorite PK
        char36 id_user FK
        char36 id_lexicalunit FK
        integer times_used
    }
    Feedback {
        char36 id_feedback PK
        char36 id_user FK
        char36 id_session FK
        integer rating
        text comment
        timestamp date
        boolean is_reviewed
        varchar id_lexicalunit FK
        text support_response
    }
    LexicalUnit {
        char36 id_lexicalunit PK
        varchar text
        varchar language
        varchar video_url
    }
    Message {
        varchar id_message PK
        varchar id_sender FK
        varchar id_receiver FK
        text content
        timestamp read_at
    }
    Notification {
        varchar id_notification PK
        varchar id_user FK
        varchar type
        varchar title
        text body
        varchar reference_id
        timestamp read_at
    }
    Region {
        char36 id_region PK
        varchar region_name
        varchar department
    }
    Role {
        char36 id_role PK
        varchar role_name
    }
    SignAvatarConfig {
        char36 id_sign_avatar PK
        char36 id_user FK
        varchar avatar_style
        varchar skin_color
        varchar clothing_color
        varchar avatar_size
        integer lsc_speed
    }
    SignInput {
        char36 id_sign_input PK
        char36 id_session FK
        varchar video_url
        text generated_text
    }
    Support {
        varchar id_support PK
        char36 id_user FK
        varchar subject
        text message
        varchar status
        timestamp date
        text solution
    }
    SystemErrorLog {
        char36 id_error PK
        varchar error_type
        varchar module
        text message
        timestamp date
    }
    TranslationDetail {
        char36 id_detail PK
        char36 id_session FK
        char36 id_lexicalunit FK
        integer order
    }
    TranslationSession {
        char36 id_session PK
        char36 id_user FK
        timestamp date_time
        varchar status
        varchar translation_type
    }
    User {
        char36 id_user PK
        char36 id_role FK
        char36 id_region FK
        varchar first_name
        varchar middle_name
        varchar last_name
        varchar second_last_name
        varchar phone
        varchar address
        varchar city
        varchar email
        varchar password_hash
        boolean is_active
    }
    VoiceInput {
        char36 id_voice_input PK
        char36 id_session FK
        varchar audio_url
        text generated_text
    }
```

## Vistas

| Vista | Lee de | La usa |
|---|---|---|
| `vw_users` | `User`, `Role`, `Region` | Listado de usuarios del administrador |
| `vw_user_dashboard` | `User`, `TranslationSession`, `FavoriteWords`, `Feedback`, `Support` | Panel del usuario |
| `vw_admin_dashboard` | Las mismas, agrupadas por usuario | Panel del administrador |
| `vw_system_statistics` | Conteos globales | Tarjetas de estadísticas |
