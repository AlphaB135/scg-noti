import React, { useEffect, useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/types";

export default function NotificationTestPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await notificationsApi.getAll(1, -1); // Fetch all notifications without limit
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <AppLayout title="Test Notifications" description="Display all notifications for testing">
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li key={notification.id} className="border p-4 rounded-md">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p>{notification.message}</p>
                  <p className="text-sm text-gray-500">Type: {notification.type}</p>
                  <p className="text-sm text-gray-500">Scheduled At: {notification.scheduledAt}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
