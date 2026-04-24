# Authentication Test Guide

## Local Testing Steps

1. **Open the app**: http://localhost:5174/
2. **Login with your credentials**: phatzombie53@gmail.com
3. **Test the debug buttons**:
   - Click "Test Storage" to verify localStorage is working
   - Click "Debug Auth" to see current authentication state
   - Click "Fix Auth" if token is missing
   - Click "Test API" to test API calls

## Expected Behavior

### After Login:
- User object should exist: `{id: 'd225752a-7392-4891-9088-99000ed64af9', email: 'phatzombie53@gmail.com'}`
- Auth token should be stored: `session_d225752a-7392-4891-9088-99000ed64af9_[timestamp]`
- User data should be stored in localStorage

### After Fix Auth:
- Should generate a new session token
- Should store user data properly
- Should allow workflow creation without 401 errors

## Debugging Commands

```javascript
// Check authentication state
console.log('User:', user)
console.log('Auth token:', localStorage.getItem('auth_token'))
console.log('User data:', localStorage.getItem('user_data'))

// Test localStorage
localStorage.setItem('test', 'value')
console.log('Test:', localStorage.getItem('test'))
localStorage.removeItem('test')
```

## Fixed Issues

1. **Token Storage**: Now properly extracts user data from API response
2. **Session Management**: Creates consistent session tokens for frontend
3. **Error Handling**: Better error messages and verification
4. **API Compatibility**: Works with cookie-based backend authentication
5. **Storage Verification**: Immediately verifies localStorage operations

## Next Steps

1. Test login flow locally
2. Verify workflow creation works
3. Test all CRUD operations
4. Deploy if everything works locally