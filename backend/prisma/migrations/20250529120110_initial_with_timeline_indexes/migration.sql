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
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT sysutcdatetime(),
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [User_updatedAt_df] DEFAULT sysutcdatetime(),
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

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
CREATE TABLE [dbo].[SecurityLog] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [action] VARCHAR(20) NOT NULL,
    [ipAddress] VARCHAR(45) NOT NULL,
    [userAgent] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SecurityLog_createdAt_df] DEFAULT sysutcdatetime(),
    CONSTRAINT [SecurityLog_pkey] PRIMARY KEY CLUSTERED ([id])
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
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [SystemSettings_updatedAt_df] DEFAULT sysutcdatetime(),
    CONSTRAINT [SystemSettings_pkey] PRIMARY KEY CLUSTERED ([id])
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

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [fingerprint] NVARCHAR(255),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Session_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [expiresAt] DATETIME2 NOT NULL,
    [refreshExpires] DATETIME2,
    [refreshToken] NVARCHAR(255),
    [status] VARCHAR(20) NOT NULL CONSTRAINT [Session_status_df] DEFAULT 'ACTIVE',
    [userAgent] NVARCHAR(500),
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [message] NVARCHAR(2000) NOT NULL,
    [scheduledAt] DATETIME2,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [Notification_status_df] DEFAULT 'PENDING',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [category] NVARCHAR(80),
    [createdBy] UNIQUEIDENTIFIER NOT NULL,
    [dueDate] DATETIME2,
    [link] NVARCHAR(255),
    [repeatIntervalDays] INT NOT NULL CONSTRAINT [Notification_repeatIntervalDays_df] DEFAULT 0,
    [type] VARCHAR(20) NOT NULL,
    [urgencyDays] INT NOT NULL CONSTRAINT [Notification_urgencyDays_df] DEFAULT 0,
    [aiGenerated] BIT NOT NULL CONSTRAINT [Notification_aiGenerated_df] DEFAULT 0,
    [aiPrompt] NVARCHAR(2000),
    [lastPostponedAt] DATETIME2,
    [originalDueDate] DATETIME2,
    [postponeCount] INT NOT NULL CONSTRAINT [Notification_postponeCount_df] DEFAULT 0,
    [postponeReason] NVARCHAR(500),
    [scheduleMonthDay] INT,
    [scheduleTime] TIME,
    [scheduleWeekDay] INT,
    [taskCompletedAt] DATETIME2,
    [taskCompletedBy] UNIQUEIDENTIFIER,
    [taskStatus] VARCHAR(20) CONSTRAINT [Notification_taskStatus_df] DEFAULT 'PENDING',
    [impact] NVARCHAR(1000),
    [linkUsername] NVARCHAR(255),
    [linkPassword] NVARCHAR(255),
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Approval] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [notificationId] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [response] VARCHAR(20) NOT NULL,
    [comment] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Approval_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Approval_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Recipient] (
    [id] NVARCHAR(1000) NOT NULL,
    [notificationId] UNIQUEIDENTIFIER NOT NULL,
    [type] VARCHAR(20) NOT NULL,
    [userId] UNIQUEIDENTIFIER,
    [companyCode] VARCHAR(12),
    [groupId] UNIQUEIDENTIFIER,
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
    [role] VARCHAR(20) NOT NULL CONSTRAINT [TeamMember_role_df] DEFAULT 'MEMBER',
    CONSTRAINT [TeamMember_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmployeeAnalytics] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [employeeId] UNIQUEIDENTIFIER NOT NULL,
    [period] VARCHAR(7) NOT NULL,
    [totalTasks] INT NOT NULL CONSTRAINT [EmployeeAnalytics_totalTasks_df] DEFAULT 0,
    [completedTasks] INT NOT NULL CONSTRAINT [EmployeeAnalytics_completedTasks_df] DEFAULT 0,
    [completedOnTime] INT NOT NULL CONSTRAINT [EmployeeAnalytics_completedOnTime_df] DEFAULT 0,
    [completedLate] INT NOT NULL CONSTRAINT [EmployeeAnalytics_completedLate_df] DEFAULT 0,
    [postponedTasks] INT NOT NULL CONSTRAINT [EmployeeAnalytics_postponedTasks_df] DEFAULT 0,
    [avgPostponeDays] FLOAT(53) NOT NULL CONSTRAINT [EmployeeAnalytics_avgPostponeDays_df] DEFAULT 0,
    [avgCompletionTime] FLOAT(53) NOT NULL CONSTRAINT [EmployeeAnalytics_avgCompletionTime_df] DEFAULT 0,
    [urgentTasksCount] INT NOT NULL CONSTRAINT [EmployeeAnalytics_urgentTasksCount_df] DEFAULT 0,
    [urgentTasksOnTime] INT NOT NULL CONSTRAINT [EmployeeAnalytics_urgentTasksOnTime_df] DEFAULT 0,
    [commonPostponeReason] NVARCHAR(500),
    [workloadScore] FLOAT(53) NOT NULL CONSTRAINT [EmployeeAnalytics_workloadScore_df] DEFAULT 0,
    [timeManagementScore] FLOAT(53) NOT NULL CONSTRAINT [EmployeeAnalytics_timeManagementScore_df] DEFAULT 0,
    [aiAnalysis] NVARCHAR(2000),
    [recommendations] NVARCHAR(1000),
    [alertLevel] VARCHAR(20) NOT NULL CONSTRAINT [EmployeeAnalytics_alertLevel_df] DEFAULT 'NORMAL',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [EmployeeAnalytics_createdAt_df] DEFAULT sysutcdatetime(),
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [EmployeeAnalytics_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [EmployeeAnalytics_employeeId_period_key] UNIQUE NONCLUSTERED ([employeeId],[period])
);

-- CreateTable
CREATE TABLE [dbo].[FileStorage] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [fileName] NVARCHAR(255) NOT NULL,
    [fileUrl] NVARCHAR(255) NOT NULL,
    [mimeType] NVARCHAR(100) NOT NULL,
    [fileSize] INT NOT NULL,
    [bucket] VARCHAR(100) NOT NULL,
    [path] NVARCHAR(500) NOT NULL,
    [uploadedBy] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FileStorage_createdAt_df] DEFAULT sysutcdatetime(),
    [updatedAt] DATETIME2 NOT NULL,
    [deleted] BIT NOT NULL CONSTRAINT [FileStorage_deleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    CONSTRAINT [FileStorage_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AuditLog] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [adminId] UNIQUEIDENTIFIER NOT NULL,
    [action] VARCHAR(50) NOT NULL,
    [module] VARCHAR(30) NOT NULL,
    [targetType] VARCHAR(30) NOT NULL,
    [targetId] NVARCHAR(100),
    [oldValue] NVARCHAR(max),
    [newValue] NVARCHAR(max),
    [ipAddress] VARCHAR(45) NOT NULL,
    [userAgent] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AuditLog_createdAt_df] DEFAULT sysutcdatetime(),
    CONSTRAINT [AuditLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[SystemChangeLog] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [changedBy] UNIQUEIDENTIFIER NOT NULL,
    [component] VARCHAR(50) NOT NULL,
    [changeType] VARCHAR(20) NOT NULL,
    [description] NVARCHAR(500) NOT NULL,
    [details] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SystemChangeLog_createdAt_df] DEFAULT sysutcdatetime(),
    CONSTRAINT [SystemChangeLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [SecurityLog_userId_createdAt_idx] ON [dbo].[SecurityLog]([userId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Session_userId_idx] ON [dbo].[Session]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Session_expiresAt_idx] ON [dbo].[Session]([expiresAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notification_status_idx] ON [dbo].[Notification]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notification_taskStatus_idx] ON [dbo].[Notification]([taskStatus]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notification_taskCompletedBy_idx] ON [dbo].[Notification]([taskCompletedBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notification_createdBy_createdAt_id_idx] ON [dbo].[Notification]([createdBy], [createdAt], [id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Approval_notificationId_idx] ON [dbo].[Approval]([notificationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Approval_userId_idx] ON [dbo].[Approval]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Approval_userId_createdAt_id_idx] ON [dbo].[Approval]([userId], [createdAt], [id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Recipient_userId_idx] ON [dbo].[Recipient]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Recipient_groupId_idx] ON [dbo].[Recipient]([groupId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Recipient_companyCode_idx] ON [dbo].[Recipient]([companyCode]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Team_leaderId_idx] ON [dbo].[Team]([leaderId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TeamMember_teamId_idx] ON [dbo].[TeamMember]([teamId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TeamMember_userId_idx] ON [dbo].[TeamMember]([employeeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmployeeAnalytics_employeeId_period_idx] ON [dbo].[EmployeeAnalytics]([employeeId], [period]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmployeeAnalytics_alertLevel_idx] ON [dbo].[EmployeeAnalytics]([alertLevel]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FileStorage_bucket_uploadedBy_idx] ON [dbo].[FileStorage]([bucket], [uploadedBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FileStorage_deleted_idx] ON [dbo].[FileStorage]([deleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_adminId_createdAt_idx] ON [dbo].[AuditLog]([adminId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_module_targetType_idx] ON [dbo].[AuditLog]([module], [targetType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_targetType_targetId_idx] ON [dbo].[AuditLog]([targetType], [targetId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [SystemChangeLog_changedBy_createdAt_idx] ON [dbo].[SystemChangeLog]([changedBy], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [SystemChangeLog_component_idx] ON [dbo].[SystemChangeLog]([component]);

-- AddForeignKey
ALTER TABLE [dbo].[EmployeeProfile] ADD CONSTRAINT [EmployeeProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AdminProfile] ADD CONSTRAINT [AdminProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SecurityLog] ADD CONSTRAINT [SecurityLog_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserNotificationPref] ADD CONSTRAINT [UserNotificationPref_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserAppearancePref] ADD CONSTRAINT [UserAppearancePref_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[WebhookConfig] ADD CONSTRAINT [WebhookConfig_integrationId_fkey] FOREIGN KEY ([integrationId]) REFERENCES [dbo].[ExternalIntegration]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Approval] ADD CONSTRAINT [Approval_notificationId_fkey] FOREIGN KEY ([notificationId]) REFERENCES [dbo].[Notification]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Approval] ADD CONSTRAINT [Approval_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Recipient] ADD CONSTRAINT [Recipient_notificationId_fkey] FOREIGN KEY ([notificationId]) REFERENCES [dbo].[Notification]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[NotificationAttachment] ADD CONSTRAINT [NotificationAttachment_notificationId_fkey] FOREIGN KEY ([notificationId]) REFERENCES [dbo].[Notification]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TeamMember] ADD CONSTRAINT [TeamMember_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TeamMember] ADD CONSTRAINT [TeamMember_teamId_fkey] FOREIGN KEY ([teamId]) REFERENCES [dbo].[Team]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[EmployeeAnalytics] ADD CONSTRAINT [EmployeeAnalytics_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FileStorage] ADD CONSTRAINT [FileStorage_uploadedBy_fkey] FOREIGN KEY ([uploadedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AuditLog] ADD CONSTRAINT [AuditLog_adminId_fkey] FOREIGN KEY ([adminId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SystemChangeLog] ADD CONSTRAINT [SystemChangeLog_changedBy_fkey] FOREIGN KEY ([changedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
