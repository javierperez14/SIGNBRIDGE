# Base de datos — SignBridge

1. [Contextualización](01-contextualizacion.md)
2. [Diagrama Relacional](02-diagrama-relacional.md) · [imagen PNG](02-diagrama-relacional.png)
3. [Scripts DDL](03-scripts-ddl.sql)
4. [Scripts DML](04-scripts-dml.sql)

## Crear la base desde cero (sin Docker)

```bash
createdb -U postgres signbridge
psql -U postgres -d signbridge -f 03-scripts-ddl.sql
psql -U postgres -d signbridge -f 04-scripts-dml.sql
```

Usuarios demo (contraseña `SignBridge2026*`): `admin@signbridge.test`, `soporte@signbridge.test`, `cliente@signbridge.test`.

> ⚠️ Los respaldos completos (`pg_dump`) **no se suben**: tienen datos personales. El `.gitignore` bloquea `respaldo*.sql` y `backup*.sql`.
