# Masar Backend

A complete backend API for a teacher recruitment platform built with Node.js, Express, TypeScript, and MongoDB. Features authentication and role-based access control for three user roles: Admin, Teacher, and School.

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

- 🏫 **Selection Flow**
  - Schools can select/accept teachers
  - WhatsApp notifications to admin (placeholder with integration examples)
  - Selection management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: Bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Project Structure

```
masar-backend/
├── src/
│   ├── config/          # Configuration files (DB, environment)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, role, and error middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts (seed admin)
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions (upload, validators)
│   ├── app.ts           # Express app setup
│   ├── server.ts        # Server entry point
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
- MongoDB (local or MongoDB Atlas)
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
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `ADMIN_EMAIL`: Initial admin email
   - `ADMIN_PASSWORD`: Initial admin password

4. **Seed the admin user**

   ```bash
   npm run seed:admin
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

## API Endpoints

### Authentication

#### Teacher

- `POST /api/auth/register/teacher` - Register new teacher
- `POST /api/auth/login/teacher` - Teacher login

#### School

- `POST /api/auth/register/school` - Register new school
- `POST /api/auth/login/school` - School login

#### Admin

- `POST /api/auth/login/admin` - Admin login

### Teachers

- `GET /api/teachers` - Get all teachers (with pagination & filters)
- `GET /api/teachers/:id` - Get teacher by ID
- `PUT /api/teachers/:id` - Update teacher profile
- `DELETE /api/teachers/:id` - Delete teacher (admin only)

### Schools

- `GET /api/schools` - Get all schools (with pagination)
- `GET /api/schools/:id` - Get school by ID
- `PUT /api/schools/:id` - Update school profile
- `DELETE /api/schools/:id` - Delete school (admin only)

### Videos

- `POST /api/videos/teachers/:id/upload` - Upload video (teacher/admin)
- `GET /api/videos` - Get all videos (with pagination & filters)
- `GET /api/videos/:id` - Get video by ID
- `DELETE /api/videos/:id` - Delete video (owner/admin)

### Selection

- `POST /api/selection/accept` - School accepts teacher
- `GET /api/selection/school/:schoolId` - Get school's selections
- `DELETE /api/selection/remove` - Remove teacher selection

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Registration (Teacher)

```json
POST /api/auth/register/teacher
{
  "fullName": "John Doe",
  "phoneNumber": "+96812345678",
  "password": "SecurePass123",
  "nationalID": "12345678",
  "gender": "male",
  "age": 30,
  "address": "Muscat, Oman",
  "academicQualification": "Bachelor of Science in Education",
  "taughtStages": ["primary", "preparatory"],
  "workedInOmanBefore": true
}
```

### Example Login

```json
POST /api/auth/login/teacher
{
  "phoneNumber": "+96812345678",
  "password": "SecurePass123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

## User Roles

### Admin

- Full access to all resources
- Can manage teachers and schools
- Access to all administrative functions
- Login with email + password

### Teacher

- Register and manage own profile
- Upload introduction videos
- View own information
- Login with phone number + password

### School

- Register and manage own profile
- Browse and select teachers
- View selected teachers
- Login with phone number + password

## WhatsApp Integration

The project includes a placeholder WhatsApp service in `src/services/whatsappService.ts`. To enable actual notifications:

### Option 1: Twilio API

```typescript
// Uncomment and configure in whatsappService.ts
const client = require('twilio')(accountSid, authToken);
await client.messages.create({
  from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
  to: `whatsapp:${adminNumber}`,
  body: message,
});
```

### Option 2: Meta Cloud API

```typescript
// Uncomment and configure in whatsappService.ts
await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: adminNumber,
    type: 'text',
    text: { body: message },
  }),
});
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed:admin` - Create initial admin user
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

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
- ✅ MongoDB injection protection
- ✅ File upload validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@masar.com or create an issue in the repository.
