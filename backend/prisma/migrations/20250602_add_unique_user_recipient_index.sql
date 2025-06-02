-- Add unique index for USER-type recipients per notification
CREATE UNIQUE INDEX uq_notification_user_recipient
ON Recipient(notificationId, userId)
WHERE type = 'USER';
