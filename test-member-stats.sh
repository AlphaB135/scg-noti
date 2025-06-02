#!/bin/bash

# Test script for member stats API
echo "🧪 Testing Member Stats API..."

# Test the bulk stats endpoint
curl -X POST http://localhost:3001/api/members/bulk-stats \
  -H "Content-Type: application/json" \
  -d '{
    "memberIds": [
      "f1c1fc83-ae57-4119-99b8-e1bd12a15bf3",
      "a2b2dc84-bf58-4220-aa9c-f2ce23b26cg4"
    ]
  }' \
  | jq '.'

echo ""
echo "✅ Test completed!"
