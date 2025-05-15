BEGIN TRY

BEGIN TRAN;

-- AddForeignKey
ALTER TABLE [dbo].[TeamMember] ADD CONSTRAINT [TeamMember_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- RenameIndex
EXEC SP_RENAME N'dbo.TeamMember.TeamMember_employeeId_idx', N'TeamMember_userId_idx', N'INDEX';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
