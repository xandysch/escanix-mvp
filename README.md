# Escanix - Digital Marketing Platform

Escanix is an innovative digital marketing platform that empowers beverage vendors to create dynamic, customizable customer experiences through intelligent QR code technologies.

## Quick Start

### Development
```bash
npm run dev
```

### Production Deployment
```bash
node build-deploy.js
```

### Database Setup
```bash
npm run db:push
```

## Deployment

This application is designed for **Autoscale deployment** on Replit. The custom build script (`build-deploy.js`) handles the directory structure alignment required for proper deployment.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Features

- 🎯 Advanced vendor analytics dashboard
- 🔗 Flexible QR code generation system  
- 🎨 Multi-template client interface builder
- 🎭 Customizable branding and color schemes
- 💬 Integrated customer feedback and engagement tools

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Build**: Vite + ESBuild