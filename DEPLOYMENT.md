# Deployment Guide for Escanix

## Overview

Escanix is a full-stack Express application with a React frontend. Due to the build configuration setup, there are specific steps required for proper deployment.

## Deployment Configuration Fix

The original deployment failed because:
- **Vite builds to**: `dist/public/` (configured in vite.config.ts)
- **Deployment expects**: `dist/` as the public directory
- **Server serves from**: `server/public` in development, but needs `dist/` in production

## Solution Applied

A custom build script (`build-deploy.js`) was created that:

1. Runs the standard Vite build process (outputs to `dist/public/`)
2. Builds the Express server bundle (outputs to `dist/index.js`)
3. Moves all frontend files from `dist/public/` to `dist/`
4. Cleans up the empty `dist/public/` directory

## Deployment Commands

### For Production Build:
```bash
node build-deploy.js
```

### For Development:
```bash
npm run dev
```

## Deployment Structure

After running the build script, your deployment directory (`dist/`) will contain:

```
dist/
├── index.html          # Frontend entry point
├── assets/             # Frontend assets (CSS, JS, images)
│   ├── index-*.css
│   ├── index-*.js
│   └── *.png           # Logo and favicon files
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