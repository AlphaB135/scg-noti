BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Notification] ADD [aiGenerated] BIT NOT NULL CONSTRAINT [Notification_aiGenerated_df] DEFAULT 0,
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
[taskStatus] VARCHAR(20) CONSTRAINT [Notification_taskStatus_df] DEFAULT 'PENDING';

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
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [EmployeeAnalytics_createdAt_df] DEFAULT SYSUTCDATETIME(),
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
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FileStorage_createdAt_df] DEFAULT SYSUTCDATETIME(),
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
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AuditLog_createdAt_df] DEFAULT SYSUTCDATETIME(),
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
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SystemChangeLog_createdAt_df] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [SystemChangeLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

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

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notification_taskStatus_idx] ON [dbo].[Notification]([taskStatus]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notification_taskCompletedBy_idx] ON [dbo].[Notification]([taskCompletedBy]);

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
