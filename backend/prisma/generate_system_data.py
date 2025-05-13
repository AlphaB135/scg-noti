import json
import uuid
import random
from datetime import datetime, timedelta

"""
Generate system‑notification seed data
--------------------------------------
*   Year‑long (12 months) schedule – every template appears once **each month**.
*   Richer set of templates (HR, Finance, Security, IT, Compliance, etc.)
*   `scheduledAt` is placed a few days **before** month‑end, determined by
    `urgencyDays` (+ some fuzz).
*   `createdAt` is back‑dated 5‑15 days before `scheduledAt`.
*   `dueDate` is the hard deadline (scheduledAt + urgencyDays).

Result is written to `system-notifications.json` with three tables:
    Notification, Recipient, NotificationAttachment ( kept empty for now )
"""

YEAR = 2025

# ---------------------------------------------------------------------------
# Helper – realistic date in the given month (relative to month‑end)
# ---------------------------------------------------------------------------

def random_monthly_date(year: int, month: int, day_back: int) -> datetime:
    """Return a datetime `day_back` days before end‑of‑month at random time."""
    first = datetime(year, month, 1)
    nxt   = datetime(year + (month == 12), (month % 12) + 1, 1)
    last  = nxt - timedelta(days=1)
    target_day = max(1, last.day - day_back)
    return datetime(year, month, target_day,
                    random.randint(0, 23), random.randint(0, 59))

# ---------------------------------------------------------------------------
# Notification templates – feel free to tweak / extend
# ---------------------------------------------------------------------------

templates = [
    {"title": "เตือนส่งเอกสารเงินเดือน",             "category": "Payroll",     "link": "/payroll/documents",       "urgencyDays": 3},
    {"title": "แจ้งสำรองข้อมูลฐานข้อมูล",            "category": "Maintenance", "link": None,                       "urgencyDays": 1},
    {"title": "แจ้งตรวจสอบสิทธิเบิกค่าใช้จ่าย",       "category": "Finance",     "link": "/finance/claims",          "urgencyDays": 2},
    {"title": "แจ้งสร้างรายงานประจำเดือน",          "category": "Reporting",   "link": "/reports/monthly",         "urgencyDays": 2},
    {"title": "แจ้งรีวิวการเข้าใช้งานระบบ",          "category": "Security",    "link": None,                       "urgencyDays": 5},
    {"title": "แจ้งตรวจสอบใบแจ้งหนี้ & PO",           "category": "Purchasing",  "link": "/purchasing/invoices",      "urgencyDays": 4},
    {"title": "แจ้งตรวจเช็คเครื่องกำเนิดไฟฟ้า",        "category": "Facility",    "link": None,                       "urgencyDays": 6},
    {"title": "เตือนอัปโหลดภาษีหัก ณ ที่จ่าย (ภ.พ.30)", "category": "Compliance",  "link": "/tax/pnd30",              "urgencyDays": 3},
    {"title": "แจ้งสำรองเอกสาร HR (ไฟล์พนักงาน)",      "category": "HR",         "link": "/hr/archive",              "urgencyDays": 7},
    {"title": "ขออนุมัติเก็บ Log File Security",      "category": "Audit",       "link": "/audit/security-log",      "urgencyDays": 2},
]

# ---------------------------------------------------------------------------
# Build data set
# ---------------------------------------------------------------------------

notifications = {"Notification": [], "Recipient": [], "NotificationAttachment": []}

# Templates for mid‑month (13–16)
mid_month_templates = [
    {"title": "เตือนติดตามผลงานกลางเดือน", "category": "Review", "link": "/review/midmonth", "urgencyDays": 2},
]

for month in range(1, 13):              # iterate through Jan‑Dec
    # -- generate end‑of‑month tasks --
    for tpl in templates:               # every template once per month
        nid = str(uuid.uuid4())

        # scheduledAt : few days before month‑end (urgencyDays ±1)
        fuzz          = random.choice([-1, 0, 1])
        scheduled_dt  = random_monthly_date(YEAR, month, tpl["urgencyDays"] + fuzz)
        scheduled_iso = scheduled_dt.isoformat() + "Z"

        # createdAt : 5‑15 days before schedule
        created_dt    = scheduled_dt - timedelta(days=random.randint(5, 15))
        created_iso   = created_dt.isoformat() + "Z"

        # dueDate : schedule + urgencyDays  (hard deadline)
        due_dt        = scheduled_dt + timedelta(days=tpl["urgencyDays"])
        due_iso       = due_dt.isoformat() + "Z"

        # ---------------- notification row ----------------
        notifications["Notification"].append({
            "id": nid,
            "title": tpl["title"],
            "message": f"{tpl['title']} ภายในวันที่ {due_iso[:10]}",
            "scheduledAt": scheduled_iso,
            "status": "PENDING",
            "type": "SYSTEM",
            "category": tpl["category"],
            "link": tpl["link"],
            "urgencyDays": tpl["urgencyDays"],
            "repeatIntervalDays": 30,
            "dueDate": due_iso,
            "createdBy": "00000000-0000-0000-0000-000000000000",
            "createdAt": created_iso,
            "updatedAt": created_iso,
        })

        # ---------------- recipient row -------------------
        notifications["Recipient"].append({
            "id": str(uuid.uuid4()),
            "notificationId": nid,
            "type": "ALL",   # broadcast
            "userId": None,
        })

    # -- generate mid‑month tasks (13–16) --
    for tpl in mid_month_templates:
        mid_nid = str(uuid.uuid4())

        # scheduledAt : random day 13–16 at random time
        scheduled_dt = datetime(YEAR, month, random.randint(13, 16),
                                random.randint(0, 23), random.randint(0, 59))
        scheduled_iso = scheduled_dt.isoformat() + "Z"

        # createdAt : 1‑3 days before schedule
        created_dt  = scheduled_dt - timedelta(days=random.randint(1, 3))
        created_iso = created_dt.isoformat() + "Z"

        # dueDate : schedule + urgencyDays
        due_dt   = scheduled_dt + timedelta(days=tpl["urgencyDays"])
        due_iso  = due_dt.isoformat() + "Z"

        # ---------------- notification row ----------------
        notifications["Notification"].append({
            "id": mid_nid,
            "title": tpl["title"],
            "message": f"{tpl['title']} ภายในวันที่ {due_iso[:10]}",
            "scheduledAt": scheduled_iso,
            "status": "PENDING",
            "type": "SYSTEM",
            "category": tpl["category"],
            "link": tpl["link"],
            "urgencyDays": tpl["urgencyDays"],
            "repeatIntervalDays": 30,
            "dueDate": due_iso,
            "createdBy": "00000000-0000-0000-0000-000000000000",
            "createdAt": created_iso,
            "updatedAt": created_iso,
        })

        # ---------------- recipient row -------------------
        notifications["Recipient"].append({
            "id": str(uuid.uuid4()),
            "notificationId": mid_nid,
            "type": "ALL",
            "userId": None,
        })

# ---------------------------------------------------------------------------
# Write out JSON
# ---------------------------------------------------------------------------

with open("system-notifications.json", "w", encoding="utf-8") as f:
    json.dump(notifications, f, ensure_ascii=False, indent=2)

print(f"Generated {len(notifications['Notification'])} notifications for {YEAR} -> system-notifications.json")
