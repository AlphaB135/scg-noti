/*
  Warnings:

  - You are about to alter the column `fingerprint` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(255)`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Session] ALTER COLUMN [fingerprint] NVARCHAR(255) NULL;
ALTER TABLE [dbo].[Session] ADD [status] VARCHAR(20) NOT NULL CONSTRAINT [Session_status_df] DEFAULT 'ACTIVE',
[userAgent] NVARCHAR(500);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
