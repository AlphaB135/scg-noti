// backend/prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import systemData from "./system-notifications.json";
import todoData from "./todo-notifications.json";

const prisma = new PrismaClient();

async function main() {
  console.log("🌐 Seeding system notifications...");
  await prisma.notification.createMany({ data: systemData.Notification });
  await prisma.recipient.createMany({ data: systemData.Recipient });
  await prisma.notificationAttachment.createMany({ data: systemData.NotificationAttachment });

  console.log("📝 Seeding to-do notifications...");
  await prisma.notification.createMany({ data: todoData.Notification });
  await prisma.recipient.createMany({ data: todoData.Recipient });
  await prisma.notificationAttachment.createMany({ data: todoData.NotificationAttachment });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
