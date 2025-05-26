BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Team] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [leaderId] UNIQUEIDENTIFIER,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Team_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Team_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TeamMember] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [teamId] UNIQUEIDENTIFIER NOT NULL,
    [employeeId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [TeamMember_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Team_leaderId_idx] ON [dbo].[Team]([leaderId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TeamMember_teamId_idx] ON [dbo].[TeamMember]([teamId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TeamMember_employeeId_idx] ON [dbo].[TeamMember]([employeeId]);

-- AddForeignKey
ALTER TABLE [dbo].[TeamMember] ADD CONSTRAINT [TeamMember_teamId_fkey] FOREIGN KEY ([teamId]) REFERENCES [dbo].[Team]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
