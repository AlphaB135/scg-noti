# Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend API Issues

**404 Error on /api/members/bulk-stats:**
- Check if members route is properly mounted in server.ts
- Verify the route exists in routes/members.ts

**Database Connection Errors:**
- Check database connection string
- Ensure database is running
- Verify table names match (recipient, not notificationRecipient)

**TypeScript Errors:**
- Check prisma client types
- Verify import statements
- Run `npm run build` to check compilation

### 2. Frontend Issues

**Navigation Not Working:**
- Check React Router setup in App.tsx
- Verify route parameters in URLs
- Check useNavigate vs useRouter usage

**API Call Failures:**
- Check baseURL in axios configuration
- Verify API endpoint URLs
- Check CORS settings

**Data Not Loading:**
- Check API response format
- Verify data transformation functions
- Check error handling in API calls

### 3. Integration Issues

**Real Data Not Showing:**
- Verify backend API returns real data
- Check if frontend is calling correct endpoints
- Verify data mapping between frontend and backend

**Performance Issues:**
- Check if caching is working
- Monitor API response times
- Verify bulk API operations

## Debug Commands

```bash
# Check backend logs
cd backend && npm run dev

# Check frontend logs
cd frontend && npm run dev

# Test API directly
curl -X POST http://localhost:3001/api/members/bulk-stats \
  -H "Content-Type: application/json" \
  -d '{"memberIds": ["test-id"]}'

# Check database
npx prisma studio
```
