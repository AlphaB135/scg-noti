BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Recipient] DROP CONSTRAINT [Recipient_notificationId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Recipient] ADD [companyCode] VARCHAR(12),
[groupId] UNIQUEIDENTIFIER;

-- AddForeignKey
ALTER TABLE [dbo].[Recipient] ADD CONSTRAINT [Recipient_notificationId_fkey] FOREIGN KEY ([notificationId]) REFERENCES [dbo].[Notification]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
