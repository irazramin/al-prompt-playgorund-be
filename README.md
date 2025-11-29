# Node Express Starter

A minimal starter template for building Node.js applications with Express.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

## Project Structure

```
node-express-starter/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Custom middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── validators/       # Request validation
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── tests/                # Test files
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Available Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user (Passport Local Strategy)
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user (requires authentication)

### User Profile
- `GET /api/v1/users/profile` - Get user profile (requires authentication)
- `PUT /api/v1/users/profile` - Update user profile (requires authentication)
- `PUT /api/v1/users/password` - Change password (requires authentication)
- `DELETE /api/v1/users/profile` - Delete account (requires authentication)

### Email Verification
- `GET /api/v1/email/verify?token=xxx` - Verify email address
- `POST /api/v1/email/resend-verification` - Resend verification email
