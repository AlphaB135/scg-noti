BEGIN TRY

BEGIN TRAN;

-- Add role column to TeamMember
ALTER TABLE [dbo].[TeamMember] ADD [role] VARCHAR(20) NOT NULL CONSTRAINT [TeamMember_role_df] DEFAULT 'MEMBER';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
