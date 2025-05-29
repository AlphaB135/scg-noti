-- Quick test data script
-- Insert a notification
INSERT INTO [Notification] (
    id, title, message, type, priority, status, createdBy, createdAt
) VALUES (
    NEWID(), 
    'Test Timeline Notification', 
    'This is a test notification for timeline API',
    'ANNOUNCEMENT',
    'MEDIUM', 
    'ACTIVE',
    (SELECT TOP 1 id FROM [User]),
    GETDATE()
);

-- Insert a recipient for the notification
INSERT INTO [NotificationRecipient] (
    id, notificationId, userId, isRead, readAt, createdAt
) VALUES (
    NEWID(),
    (SELECT TOP 1 id FROM [Notification] ORDER BY createdAt DESC),
    (SELECT TOP 1 id FROM [User]),
    0,
    NULL,
    GETDATE()
);

-- Insert an approval
INSERT INTO [Approval] (
    id, notificationId, userId, response, comment, createdAt
) VALUES (
    NEWID(),
    (SELECT TOP 1 id FROM [Notification] ORDER BY createdAt DESC),
    (SELECT TOP 1 id FROM [User]),
    'APPROVED',
    'Test approval for timeline',
    GETDATE()
);
