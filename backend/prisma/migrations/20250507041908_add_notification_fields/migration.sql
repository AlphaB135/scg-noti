/*
  Warnings:

  - Added the required column `createdBy` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Notification] ADD [category] NVARCHAR(80),
[createdBy] UNIQUEIDENTIFIER NOT NULL,
[dueDate] DATETIME2,
[link] NVARCHAR(255),
[repeatIntervalDays] INT NOT NULL CONSTRAINT [Notification_repeatIntervalDays_df] DEFAULT 0,
[type] VARCHAR(20) NOT NULL,
[urgencyDays] INT NOT NULL CONSTRAINT [Notification_urgencyDays_df] DEFAULT 0;

-- CreateTable
CREATE TABLE [dbo].[Recipient] (
    [id] NVARCHAR(1000) NOT NULL,
    [notificationId] UNIQUEIDENTIFIER NOT NULL,
    [type] VARCHAR(20) NOT NULL,
    [userId] UNIQUEIDENTIFIER,
    CONSTRAINT [Recipient_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[NotificationAttachment] (
    [id] NVARCHAR(1000) NOT NULL,
    [notificationId] UNIQUEIDENTIFIER NOT NULL,
    [fileName] NVARCHAR(255) NOT NULL,
    [fileUrl] NVARCHAR(255) NOT NULL,
    [mimeType] NVARCHAR(100) NOT NULL,
    CONSTRAINT [NotificationAttachment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Recipient] ADD CONSTRAINT [Recipient_notificationId_fkey] FOREIGN KEY ([notificationId]) REFERENCES [dbo].[Notification]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[NotificationAttachment] ADD CONSTRAINT [NotificationAttachment_notificationId_fkey] FOREIGN KEY ([notificationId]) REFERENCES [dbo].[Notification]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
