import json
import uuid
import random
from datetime import datetime, timedelta

def random_datetime(start, end):
    """Generate a random ISO datetime string between two datetimes."""
    delta = end - start
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return (start + timedelta(seconds=random_seconds)).isoformat() + "Z"

# Define time range for creation and due dates
start_date = datetime(2025, 1, 1)
end_date = datetime(2025, 5, 7, 23, 59)

# Generate 100 To-Do notifications
todo_notifications = {"Notification": [], "Recipient": [], "NotificationAttachment": []}
titles = [
    "Submit Expense Report",
    "Review Timesheet",
    "Approve Leave Request",
    "Update Profile",
    "Complete Training Module"
]
categories = ["Finance", "HR", "Profile", "Training", "Operations"]

for _ in range(100):
    nid = str(uuid.uuid4())
    created_at = random_datetime(start_date, end_date)
    due_date = random_datetime(start_date, end_date)
    status = random.choice(["PENDING", "IN_PROGRESS", "OVERDUE"])
    title = random.choice(titles)
    category = random.choice(categories)
    user_id = str(uuid.uuid4())  # Simulated individual user assignment
    todo_notifications["Notification"].append({
        "id": nid,
        "title": title,
        "message": f"{title} due by {due_date[:10]}",
        "scheduledAt": created_at,
        "status": status,
        "type": "TODO",
        "category": category,
        "link": f"/tasks/{nid}",
        "urgencyDays": random.randint(0, 3),
        "repeatIntervalDays": 0,
        "dueDate": due_date,
        "createdBy": user_id,
        "createdAt": created_at,
        "updatedAt": created_at
    })
    todo_notifications["Recipient"].append({
        "id": str(uuid.uuid4()),
        "notificationId": nid,
        "type": "USER",
        "userId": user_id
    })

# Write to JSON file
with open("todo-notifications.json", "w", encoding="utf-8") as f:
    json.dump(todo_notifications, f, ensure_ascii=False, indent=2)

print("Generated todo-notifications.json with 100 To-Do entries.")
