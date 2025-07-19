# Deployment Guide for Escanix

## Overview

Escanix is a full-stack Express application with a React frontend. Due to the build configuration setup, there are specific steps required for proper deployment.

## Deployment Configuration Fix

### Original Issue
The deployment was failing with the error:
```
Invalid run command 'www.escanix.com.br' - this appears to be a domain name rather than an executable command
```

### Root Cause Analysis
The deployment was failing because:
- **Server static file serving**: Expected files in `dist/public/` directory
- **Vite builds to**: `dist/public/` (configured in vite.config.ts)
- **Previous build script**: Was moving files from `dist/public/` to `dist/` 
- **Result**: Server couldn't find static files in expected location

### Solution Applied

Fixed the build script (`build-deploy.js`) to:

1. Run the standard Vite build process (outputs to `dist/public/`)
2. Build the Express server bundle (outputs to `dist/index.js`)
3. **Keep the `dist/public/` structure** that the server expects
4. Maintain proper directory structure for deployment

## Deployment Commands

### For Production Build:
```bash
node build-deploy.js
```

**Alternative (using npm):**
```bash
npm run build
```

### For Development:
```bash
npm run dev
```

### For Production Start:
```bash
npm start
```
**Direct command:**
```bash
NODE_ENV=production node dist/index.js
```

## Deployment Structure

After running the build script, your deployment directory (`dist/`) will contain:

```
dist/
├── public/             # Frontend static files (served by Express)
│   ├── index.html      # Frontend entry point
│   └── assets/         # Frontend assets (CSS, JS, images)
│       ├── index-*.css
│       ├── index-*.js
│       └── *.png       # Logo and favicon files
└── index.js            # Backend Express server bundle
```

## Deployment Types

### Recommended: Autoscale Deployment
Since this is a full-stack Express application, **Autoscale deployment** is recommended over static deployment:

- Handles both frontend serving and backend API routes
- Automatically manages scaling based on traffic
- Supports the Express server with database connections
- Properly handles environment variables and secrets

### Static Deployment (Alternative)
If using static deployment, ensure:
- Public directory is set to `dist`
- Backend functionality will not work (API routes, database)
- Only suitable for frontend-only builds

## Environment Variables Required

For production deployment, ensure these environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV=production`

## Notes

- The core Vite configuration files cannot be modified due to environment protection
- The build script is the recommended solution for deployment directory alignment
- Both frontend and backend are served from the same Express server on a single port