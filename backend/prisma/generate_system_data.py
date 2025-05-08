import json
import uuid
import random
from datetime import datetime, timedelta

def random_monthly_date(year, month, day_range):
    """
    Generate a realistic scheduled date for monthly notifications.
    day_range: tuple(min_day, max_day) relative to end of month.
    """
    # Calculate end of month date
    first_of_month = datetime(year, month, 1)
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    last_of_month = next_month - timedelta(days=1)
    # Choose a day relative to end_of_month within day_range
    day = last_of_month.day - random.randint(day_range[0], day_range[1])
    scheduled = datetime(year, month, max(1, day), random.randint(0,23), random.randint(0,59))
    return scheduled.isoformat() + "Z"

# Notification templates
templates = [
    {"title": "เตือนส่งเอกสารเงินเดือน", "category": "Payroll", "link": "/payroll/documents", "urgencyDays": 3},
    {"title": "แจ้งสำรองข้อมูลฐานข้อมูล", "category": "Maintenance", "link": None, "urgencyDays": 1},
    {"title": "แจ้งตรวจสอบสิทธิเบิกค่าใช้จ่าย", "category": "Finance", "link": "/finance/claims", "urgencyDays": 2},
    {"title": "แจ้งสร้างรายงานประจำเดือน", "category": "Reporting", "link": "/reports/monthly", "urgencyDays": 2},
    {"title": "แจ้งรีวิวการเข้าใช้งานระบบ", "category": "Security", "link": None, "urgencyDays": 5},
]

# Generate 100 system notifications
notifications = {"Notification": [], "Recipient": [], "NotificationAttachment": []}
year = 2025
for i in range(100):
    month = random.randint(1, 12)
    tpl = random.choice(templates)
    nid = str(uuid.uuid4())
    scheduledAt = random_monthly_date(year, month, (tpl["urgencyDays"], tpl["urgencyDays"]+2))
    createdAt = (datetime.fromisoformat(scheduledAt.replace("Z","")) - timedelta(days=random.randint(5,15)))
    notifications["Notification"].append({
        "id": nid,
        "title": tpl["title"],
        "message": f"{tpl['title']} ภายในวันที่ {scheduledAt[:10]}",
        "scheduledAt": scheduledAt,
        "status": "PENDING",
        "type": "SYSTEM",
        "category": tpl["category"],
        "link": tpl["link"],
        "urgencyDays": tpl["urgencyDays"],
        "repeatIntervalDays": 30,
        "dueDate": None,
        "createdBy": "00000000-0000-0000-0000-000000000000",
        "createdAt": createdAt.isoformat() + "Z",
        "updatedAt": createdAt.isoformat() + "Z"
    })
    notifications["Recipient"].append({
        "id": str(uuid.uuid4()),
        "notificationId": nid,
        "type": "ALL",
        "userId": None
    })

# Write to JSON file
with open("system-notifications.json", "w", encoding="utf-8") as f:
    json.dump(notifications, f, ensure_ascii=False, indent=2)

print("Generated system-notifications.json with 100 realistic entries.")
