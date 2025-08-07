# Deployment Guide

## Overview

This guide addresses the deployment configuration fixes for the Recipe Finder Application, including static file serving, session management, and error handling.

## Deployment Preparation

### 1. Build and Deploy Process

Run these commands in order for deployment:

```bash
# 1. Build the application
npm run build

# 2. Prepare deployment files (fixes static path issue)
node deploy-prep.js

# 3. Start production server
npm run start
```

### 2. Environment Variables Required

The following environment variables must be set in your deployment environment:

#### SESSION_SECRET (Required for Production)
```bash
SESSION_SECRET=your-secure-random-32-character-string
```

**To generate a secure session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example:**
```bash
SESSION_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 3. Deployment Platform Setup

#### For Replit Deployments:
1. Go to your Repl's "Secrets" tab
2. Add a new secret:
   - Key: `SESSION_SECRET`
   - Value: Your generated secure string (see above)

#### For Other Platforms:
Add the `SESSION_SECRET` environment variable through your platform's environment configuration:
- Heroku: `heroku config:set SESSION_SECRET=your-secret`
- Vercel: Add to environment variables in dashboard
- Railway: Add to environment variables in dashboard

## Issues Fixed

### ✅ Fix 1: Static File Serving Path
**Problem:** `Static build directory 'dist/public' not found in serveStatic function`

**Solution:** The `deploy-prep.js` script copies files from `dist/public` (Vite build output) to `server/public` (expected by server).

**What it does:**
- Validates that the build directory exists
- Creates the `server/public` directory
- Copies all static files to the correct location
- Verifies critical files like `index.html` are present

### ✅ Fix 2: SESSION_SECRET Environment Variable
**Problem:** `Missing SESSION_SECRET environment variable for session-based authentication`

**Solution:** Added session configuration with proper environment variable validation.

**Features added:**
- Production environment validation that exits if `SESSION_SECRET` is missing
- Secure session configuration with appropriate cookie settings
- Development fallback (with warning) for local development
- Clear error messages with setup instructions

### ✅ Fix 3: Enhanced Error Handling
**Problem:** Need better error handling for missing build directory

**Solution:** The deployment preparation script provides detailed error messages and validation.

**Improvements:**
- Pre-deployment validation of build output
- Clear error messages with step-by-step fix instructions
- Verification of critical files before deployment
- Helpful logging during the preparation process

## Session Configuration Details

The session middleware is now configured with:

- **Secret**: Uses `SESSION_SECRET` environment variable (required in production)
- **Secure cookies**: Only in production (HTTPS)
- **HTTP-only cookies**: Prevents XSS attacks
- **Session duration**: 24 hours
- **No unnecessary session storage**: Only creates sessions when needed

## Troubleshooting

### Build Issues
If you see "Build directory not found":
1. Ensure you ran `npm run build` successfully
2. Check that `dist/public` directory was created
3. Verify no build errors occurred

### Session Secret Issues
If you see "Missing SESSION_SECRET":
1. Confirm the environment variable is set in your deployment platform
2. Verify the variable name is exactly `SESSION_SECRET`
3. Ensure the value is a secure random string (not a placeholder)

### Static File Issues
If static files aren't loading:
1. Run `node deploy-prep.js` after building
2. Verify `server/public` directory was created with files
3. Check that `index.html` exists in the directory

## Production Checklist

Before deploying to production:

- [ ] Built the application (`npm run build`)
- [ ] Ran deployment preparation (`node deploy-prep.js`)
- [ ] Set `SESSION_SECRET` environment variable
- [ ] Verified `NODE_ENV=production` is set
- [ ] Tested the application locally with production build

## Development vs Production

### Development:
- Uses development session secret (with console warning)
- Vite serves files directly
- Hot module reloading enabled

### Production:
- Requires `SESSION_SECRET` environment variable
- Serves static files from `server/public`
- Secure session configuration
- Production-optimized builds