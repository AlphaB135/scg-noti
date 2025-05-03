BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[EmployeeProfile] (
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [companyCode] VARCHAR(12) NOT NULL,
    [employeeCode] VARCHAR(30) NOT NULL,
    [firstName] NVARCHAR(80) NOT NULL,
    [lastName] NVARCHAR(80) NOT NULL,
    [nickname] NVARCHAR(60),
    [position] NVARCHAR(120),
    [profileImageUrl] NVARCHAR(255),
    [lineToken] NVARCHAR(255),
    CONSTRAINT [EmployeeProfile_pkey] PRIMARY KEY CLUSTERED ([userId]),
    CONSTRAINT [EmployeeProfile_employeeCode_key] UNIQUE NONCLUSTERED ([employeeCode])
);

-- AddForeignKey
ALTER TABLE [dbo].[EmployeeProfile] ADD CONSTRAINT [EmployeeProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
