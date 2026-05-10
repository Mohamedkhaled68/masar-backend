# Masar Backend

A complete backend API for a teacher recruitment platform built with Node.js, Express, TypeScript, and PostgreSQL. Features authentication and role-based access control for three user roles: Admin, Teacher, and School.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (Admin, Teacher, School)
  - Bcrypt password hashing
  - Secure route protection

- 👥 **User Management**
  - Teacher registration and profiles
  - School registration and profiles
  - Admin user management
  - Profile updates and validation

- 🎥 **Video Upload**
  - Teachers can upload introduction videos
  - File validation (MP4, MOV, WEBM)
  - Video management and deletion
  - Stream routing with HTTP Range requests support

- 🏫 **Selection & Acceptance Flow**
  - Schools can browse, select, and accept teachers
  - Admin tracking of selection and acceptance processes
  - WhatsApp notifications placeholder integration for updates

- 🎓 **Specialties Management**
  - Manage various educational specialties for teachers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: Bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Project Structure

```
masar-backend/
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── config/          # Configuration files (DB, environment)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, role, and error middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic services (e.g. WhatsApp)
│   ├── utils/           # Utility functions (upload, validators)
│   ├── app.ts           # Express app setup
│   ├── server.ts        # Server entry point
│   ├── prisma.ts        # Prisma client initialization
│   └── types.d.ts       # TypeScript type definitions
├── uploads/             # Uploaded files directory
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd masar-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your settings:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `PORT`: API Port (default 5000)

4. **Initialize Database**

   Push the Prisma schema to the database to create the necessary tables:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints Overview

- **/api/auth** - Registration and Login for Admin, Teacher, and School
- **/api/teachers** - Teacher directory, profiles, and management
- **/api/schools** - School directory, profiles, and management
- **/api/videos** - Teacher video uploads and streaming
- **/api/selection** - Schools selecting teachers
- **/api/specialties** - Managing educational specialties
- **/api/acceptance** - Schools giving final acceptance to teachers

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

### Admin
- Full access to all resources
- Can manage teachers, schools, specialties, and acceptances
- Access to all administrative functions

### Teacher
- Register and manage own profile
- Upload introduction videos
- Manage specialties linked to their profile
- Login with phone number + password

### School
- Register and manage own profile
- Browse and select teachers
- Send and track acceptances for teachers
- Login with phone number + password

## WhatsApp Integration

The project includes a placeholder WhatsApp service in `src/services/whatsappService.ts`. It provides an architecture for integrating Twilio or Meta Cloud API to send notifications about acceptances and important events.

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Helmet for security headers
- ✅ CORS configuration
- ✅ Request validation
- ✅ Prisma ORM type safety and SQL injection protection
- ✅ File upload validation

## License

This project is licensed under the MIT License.
