# Migii Dashboard

A comprehensive platform for managing migrant workers, including both web and mobile applications.

## Project Structure

```
migii-dashboard/
├── server/                 # Backend server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── config/            # Configuration files
│   └── utils/             # Utility functions
├── web/                   # Web application (React)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── context/      # React context
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── mobile/               # Mobile application (React Native)
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── screens/      # Screen components
    │   ├── navigation/   # Navigation configuration
    │   ├── services/     # API services
    │   └── utils/        # Utility functions
    └── assets/          # Static assets
```

## Features

### Web Application
- Admin Dashboard
  - Worker Management
  - Location Tracking
  - Analytics & Reports
  - User Management
- Worker Portal
  - Profile Management
  - Job Search
  - Location Updates
  - Communication

### Mobile Application
- Worker Features
  - Profile Management
  - Location Sharing
  - Job Search
  - Emergency Alerts
  - Communication
- Admin Features
  - Worker Tracking
  - Quick Actions
  - Notifications

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- WebSocket for real-time updates
- JWT Authentication

### Web Frontend
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Query
- React Router

### Mobile Frontend
- React Native
- TypeScript
- React Navigation
- React Query
- Native Base UI

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- React Native development environment

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/migii-dashboard.git
cd migii-dashboard
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install web dependencies
cd ../web
npm install

# Install mobile dependencies
cd ../mobile
npm install
```

3. Set up environment variables:
```bash
# Server
cp server/.env.example server/.env

# Web
cp web/.env.example web/.env

# Mobile
cp mobile/.env.example mobile/.env
```

4. Start the development servers:
```bash
# Start backend server
cd server
npm run dev

# Start web application
cd ../web
npm run dev

# Start mobile application
cd ../mobile
npm start
```

## API Documentation

The API documentation is available at `/api/docs` when running the server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

