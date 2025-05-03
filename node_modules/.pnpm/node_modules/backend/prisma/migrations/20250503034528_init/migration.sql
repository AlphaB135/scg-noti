BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(160) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [role] VARCHAR(20) NOT NULL,
    [status] VARCHAR(10) NOT NULL CONSTRAINT [User_status_df] DEFAULT 'ACTIVE',
    [lastLoginAt] DATETIME2,
    [lastLoginIp] VARCHAR(45),
    [loginFailCount] INT NOT NULL CONSTRAINT [User_loginFailCount_df] DEFAULT 0,
    [twoFaSecret] NVARCHAR(64),
    [deviceFingerprint] NVARCHAR(128),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [User_updatedAt_df] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[AdminProfile] (
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [firstName] NVARCHAR(80) NOT NULL,
    [lastName] NVARCHAR(80) NOT NULL,
    [nickname] NVARCHAR(60),
    [position] NVARCHAR(120),
    [profileImageUrl] NVARCHAR(255),
    CONSTRAINT [AdminProfile_pkey] PRIMARY KEY CLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[SystemSettings] (
    [id] INT NOT NULL,
    [systemName] NVARCHAR(120) NOT NULL,
    [defaultLanguage] NVARCHAR(10) NOT NULL,
    [dateFormat] NVARCHAR(20) NOT NULL,
    [timeFormat] VARCHAR(8) NOT NULL,
    [timezone] NVARCHAR(40) NOT NULL,
    [autoLogoutMinutes] INT NOT NULL,
    [enableAuditLogging] BIT NOT NULL,
    [enableAnalytics] BIT NOT NULL,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [SystemSettings_updatedAt_df] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [SystemSettings_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserNotificationPref] (
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [emailEnabled] BIT NOT NULL CONSTRAINT [UserNotificationPref_emailEnabled_df] DEFAULT 1,
    [pushEnabled] BIT NOT NULL CONSTRAINT [UserNotificationPref_pushEnabled_df] DEFAULT 1,
    [smsEnabled] BIT NOT NULL CONSTRAINT [UserNotificationPref_smsEnabled_df] DEFAULT 0,
    [digestFreq] VARCHAR(10) NOT NULL,
    [sound] NVARCHAR(50) NOT NULL CONSTRAINT [UserNotificationPref_sound_df] DEFAULT 'Default',
    [quietHoursStart] TIME,
    [quietHoursEnd] TIME,
    CONSTRAINT [UserNotificationPref_pkey] PRIMARY KEY CLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[UserAppearancePref] (
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [theme] VARCHAR(10) NOT NULL,
    [accentColor] NVARCHAR(20) NOT NULL,
    [density] VARCHAR(12) NOT NULL,
    CONSTRAINT [UserAppearancePref_pkey] PRIMARY KEY CLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[SecurityLog] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [action] VARCHAR(20) NOT NULL,
    [ipAddress] VARCHAR(45) NOT NULL,
    [userAgent] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SecurityLog_createdAt_df] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [SecurityLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[IntegrationSMTP] (
    [id] INT NOT NULL,
    [server] NVARCHAR(120) NOT NULL,
    [port] INT NOT NULL,
    [username] NVARCHAR(120) NOT NULL,
    [passwordEnc] NVARCHAR(255) NOT NULL,
    [useTls] BIT NOT NULL CONSTRAINT [IntegrationSMTP_useTls_df] DEFAULT 1,
    [lastTestedAt] DATETIME2,
    CONSTRAINT [IntegrationSMTP_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ExternalIntegration] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [type] VARCHAR(12) NOT NULL,
    [displayName] NVARCHAR(120) NOT NULL,
    [active] BIT NOT NULL CONSTRAINT [ExternalIntegration_active_df] DEFAULT 0,
    [configJson] NVARCHAR(4000) NOT NULL,
    [lastSyncedAt] DATETIME2,
    [status] VARCHAR(8) NOT NULL,
    CONSTRAINT [ExternalIntegration_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[WebhookConfig] (
    [integrationId] UNIQUEIDENTIFIER NOT NULL,
    [url] NVARCHAR(255) NOT NULL,
    [secret] NVARCHAR(128) NOT NULL,
    [eventCreated] BIT NOT NULL CONSTRAINT [WebhookConfig_eventCreated_df] DEFAULT 0,
    [eventApproved] BIT NOT NULL CONSTRAINT [WebhookConfig_eventApproved_df] DEFAULT 0,
    [eventUpdated] BIT NOT NULL CONSTRAINT [WebhookConfig_eventUpdated_df] DEFAULT 0,
    [eventRejected] BIT NOT NULL CONSTRAINT [WebhookConfig_eventRejected_df] DEFAULT 0,
    CONSTRAINT [WebhookConfig_pkey] PRIMARY KEY CLUSTERED ([integrationId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [SecurityLog_userId_createdAt_idx] ON [dbo].[SecurityLog]([userId], [createdAt]);

-- AddForeignKey
ALTER TABLE [dbo].[AdminProfile] ADD CONSTRAINT [AdminProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserNotificationPref] ADD CONSTRAINT [UserNotificationPref_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserAppearancePref] ADD CONSTRAINT [UserAppearancePref_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SecurityLog] ADD CONSTRAINT [SecurityLog_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[WebhookConfig] ADD CONSTRAINT [WebhookConfig_integrationId_fkey] FOREIGN KEY ([integrationId]) REFERENCES [dbo].[ExternalIntegration]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
