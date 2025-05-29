-- Create indexes for Recipient table to improve notification query performance
CREATE NONCLUSTERED INDEX IX_Recipient_userId ON [dbo].[Recipient] ([userId]) WHERE [userId] IS NOT NULL;
CREATE NONCLUSTERED INDEX IX_Recipient_groupId ON [dbo].[Recipient] ([groupId]) WHERE [groupId] IS NOT NULL;
CREATE NONCLUSTERED INDEX IX_Recipient_companyCode ON [dbo].[Recipient] ([companyCode]) WHERE [companyCode] IS NOT NULL;

-- Create composite index for common query patterns
CREATE NONCLUSTERED INDEX IX_Recipient_composite ON [dbo].[Recipient] ([userId], [groupId], [companyCode]) 
    INCLUDE ([notificationId]) WHERE [userId] IS NOT NULL OR [groupId] IS NOT NULL OR [companyCode] IS NOT NULL;
