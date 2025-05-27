#!/bin/bash

# Configuration
API_URL="http://localhost:3001/api"
TEST_USER_EMPLOYEE_CODE="C001-1001"
TEST_USER_PASSWORD="123456" 
TEST_RESULTS_DIR="test-results"

# Create results directory if it doesn't exist
mkdir -p "$TEST_RESULTS_DIR"

# Function to handle response and errors
handle_response() {
  local status=$1
  local response=$2
  local test_name=$3
  
  # Save response to file
  echo "$response" > "$TEST_RESULTS_DIR/${test_name}.json"
  
  if [ $status -ge 200 ] && [ $status -lt 300 ]; then
    echo "✅ $test_name: Success"
  else
    echo "❌ $test_name: Failed (Status: $status)"
    echo "Response: $response"
    exit 1
  fi
}

echo "🔄 Starting notification API test with link credentials..."

# Step 1: Login and get authentication token
echo "1️⃣ Authenticating user..."
response_tmp_file=$(mktemp)
http_code=$(curl -s -i -o "$response_tmp_file" -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"employeeCode\":\"$TEST_USER_EMPLOYEE_CODE\",\"password\":\"$TEST_USER_PASSWORD\"}" \
  "${API_URL}/auth/login")

auth_body=$(cat "$response_tmp_file")
auth_status=$http_code
rm "$response_tmp_file"

# Save full response and extract status code
echo "Full response:"
echo "$auth_body"
echo "Status code: $auth_status"

# Check authentication response
if [ "$auth_status" != "200" ]; then
  echo "❌ Authentication failed with status $auth_status"
  exit 1
fi

# Get token from response headers - extract just the JWT value without token=
auth_cookie=$(echo "$auth_body" | grep -i '^set-cookie:' | head -n 1 | grep -o 'token=[^;]*' | sed 's/token=//')

if [ -z "$auth_cookie" ]; then
  echo "❌ No authentication token found in response"
  echo "Checking response body for token..."
  # Try to get token from response body as fallback
  auth_cookie=$(echo "$auth_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  if [ -z "$auth_cookie" ]; then
    echo "❌ No token found in response body either"
    exit 1
  fi
fi

echo "Found auth token: ${auth_cookie:0:20}..."

echo "✅ Authentication successful"

# Step 2: Create notification with link credentials
echo "2️⃣ Creating notification with link credentials..."
create_payload='{
  "title": "System Login Test",
  "message": "Testing link credentials functionality",
  "type": "SYSTEM",
  "category": "TEST",
  "link": "https://example.com/login",
  "linkUsername": "testuser123",
  "linkPassword": "testpass456",
  "urgencyDays": 0,
  "repeatIntervalDays": 0,
  "scheduledAt": "2025-01-01T00:00:00.000Z",
  "recipients": [{"type": "ALL"}]
}'

echo "Sending request with token: ${auth_cookie:0:20}..."
create_response=$(curl -s -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: token=$auth_cookie" \
  --max-time 10 \
  --connect-timeout 5 \
  -v \
  -d "$create_payload" \
  "${API_URL}/notifications" 2>&1)

echo "Raw response from create:"
echo "$create_response"

create_status=${create_response: -3}
create_body=${create_response:0:${#create_response}-3}
notification_id=$(echo "$create_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

handle_response $create_status "$create_body" "create_notification"

# Step 3: Get the created notification
echo "3️⃣ Fetching created notification..."
get_response=$(curl -s -w "%{http_code}" \
  -H "Cookie: token=$auth_cookie" \
  "$API_URL/notifications/$notification_id")

get_status=${get_response: -3}
get_body=${get_response:0:${#get_response}-3}

handle_response $get_status "$get_body" "get_notification"

# Step 4: Update notification credentials 
echo "4️⃣ Updating notification credentials..."
update_payload='{
  "linkUsername": "updateduser123",
  "linkPassword": "updatedpass456"
}'

update_response=$(curl -s -w "%{http_code}" -X PUT \
  -H "Content-Type: application/json" \
  -H "Cookie: token=$auth_cookie" \
  -d "$update_payload" \
  "${API_URL}/notifications/$notification_id")

update_status=${update_response: -3}
update_body=${update_response:0:${#update_response}-3}

handle_response $update_status "$update_body" "update_notification"

# Step 5: Verify updates
echo "5️⃣ Verifying updates..."
verify_response=$(curl -s -w "%{http_code}" \
  -H "Cookie: token=$auth_cookie" \
  "$API_URL/notifications/$notification_id")

verify_status=${verify_response: -3}
verify_body=${verify_response:0:${#verify_response}-3}

handle_response $verify_status "$verify_body" "verify_updates"

# Step 6: Compare original and updated values
echo "6️⃣ Comparing credential changes..."
if echo "$verify_body" | grep -q "updateduser123" && echo "$verify_body" | grep -q "updatedpass456"; then
  echo "✅ Credential update verified successfully"
else
  echo "❌ Credential update verification failed"
  exit 1
fi

echo "✨ All tests completed successfully!"
  "linkPassword": "password123",
  "urgencyDays": 0,
  "repeatIntervalDays": 0,
  "scheduledAt": "2025-06-01T00:00:00.000Z",
  "status": "PENDING",
  "recipients": [{"type": "ALL"}]
}'

api_call "POST" "/notifications" "$notification_data" "$token" "response_create.txt"

# Extract ID from the response (handle both verbose output and JSON)
notification_id=$(cat response_create.txt | sed -n '/^{/,/^}/p' | tr -d '\n' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$notification_id" ]; then
  # Try extracting from raw response
  notification_id=$(cat response_create.txt | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

echo "Extracted Notification ID: $notification_id"

# Update the notification with new linkUsername and linkPassword
echo -e "\n2. Updating the notification with new linkUsername and linkPassword..."
update_data='{
  "title": "Updated Notification",
  "linkUsername": "updateduser",
  "linkPassword": "updatedpassword"
}'

if [ -n "$notification_id" ]; then
  api_call "PUT" "/notifications/$notification_id" "$update_data" "$token" "response_update.txt"

  # Get the notification details to verify the update
  echo -e "\n3. Getting notification details to verify the update..."
  api_call "GET" "/notifications/$notification_id" "" "$token" "response_get.txt"
else
  echo "ERROR: Cannot update or get notification details - notification_id is empty"
fi

echo -e "\nTests completed"
