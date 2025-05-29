-- scripts/create_shadow_db.sql
--
-- Create shadow database for Prisma migrations (SQL Server)
-- Only needed for local/dev. Run as a user with CREATE DATABASE on the server.
--
-- Usage: Run this before running `prisma migrate dev` if you lack CREATE DATABASE on master.

CREATE DATABASE scg_dashboard_shadow;
GO
ALTER AUTHORIZATION ON DATABASE::scg_dashboard_shadow TO scg_app;
GO
EXEC sp_addrolemember 'db_owner', 'scg_app';
GO
