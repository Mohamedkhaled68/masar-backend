# Specialty Management System - API Documentation

## Overview

The specialty management system allows admins to manage teaching specialties, teachers to select their specialties, and videos to be linked to specific specialties.

---

## 🎯 Features

1. **Admin can:**
   - Create new specialties
   - Update existing specialties
   - Delete specialties
   - View all specialties

2. **Teachers can:**
   - Choose specialties during registration
   - Upload videos for their registered specialties
   - View available specialties

3. **Videos:**
   - Each video is linked to one specialty
   - Can be filtered by specialty

---

## 📋 API Endpoints

### Specialty Management (Admin)

#### 1. Get All Specialties

```http
GET /api/specialties
Authorization: Bearer <token>
```

**Query Parameters:**

- `active` (optional): `true` | `false` - Filter by active status

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "674f5e8a8b9c1d2e3f4a5b6c",
      "name": "Mathematics",
      "nameAr": "الرياضيات",
      "description": "Mathematics and Applied Mathematics",
      "isActive": true,
      "createdAt": "2024-12-08T10:00:00.000Z",
      "updatedAt": "2024-12-08T10:00:00.000Z"
    }
  ]
}
```

#### 2. Get Specialty by ID

```http
GET /api/specialties/:id
Authorization: Bearer <token>
```

#### 3. Create Specialty (Admin Only)

```http
POST /api/specialties
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Mathematics",
  "nameAr": "الرياضيات",
  "description": "Mathematics and Applied Mathematics",
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Specialty created successfully",
  "data": {
    "_id": "674f5e8a8b9c1d2e3f4a5b6c",
    "name": "Mathematics",
    "nameAr": "الرياضيات",
    "description": "Mathematics and Applied Mathematics",
    "isActive": true
  }
}
```

#### 4. Update Specialty (Admin Only)

```http
PUT /api/specialties/:id
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Advanced Mathematics",
  "description": "Advanced Mathematics and Applied Mathematics",
  "isActive": true
}
```

#### 5. Delete Specialty (Admin Only)

```http
DELETE /api/specialties/:id
Authorization: Bearer <admin-token>
```

---

## 👨‍🏫 Teacher Registration with Specialties

### Updated Teacher Registration

```http
POST /api/auth/register/teacher
Content-Type: application/json
```

**Request Body (Updated):**

```json
{
  "fullName": "Ahmed Ali",
  "phoneNumber": "+96812345678",
  "password": "SecurePass123",
  "nationalID": "87654321",
  "gender": "male",
  "age": 32,
  "address": "Muscat, Oman",
  "academicQualification": "Master's Degree",
  "specialties": ["674f5e8a8b9c1d2e3f4a5b6c", "674f5e8a8b9c1d2e3f4a5b6d"],
  "taughtStages": ["primary", "preparatory"],
  "workedInOmanBefore": true,
  "diploma": "Teaching Diploma",
  "courses": ["Math", "Physics"]
}
```

**New Required Field:**

- `specialties` (array of specialty IDs) - **Required**, at least one specialty

**Response:**

```json
{
  "success": true,
  "message": "Teacher registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "fullName": "Ahmed Ali",
      "specialties": [
        "674f5e8a8b9c1d2e3f4a5b6c",
        "674f5e8a8b9c1d2e3f4a5b6d"
      ],
      "videos": [],
      ...
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

## 🎥 Video Upload with Specialty

### Upload Video

```http
POST /api/videos/upload
Authorization: Bearer <teacher-token>
Content-Type: multipart/form-data
```

**Request Body (form-data):**

- `video` (file) - The video file (MP4, MOV, WEBM)
- `title` (text) - Video title
- `specialtyId` (text) - **Required** - Specialty ID

**Example using cURL:**

```bash
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer <teacher-token>" \
  -F "video=@/path/to/video.mp4" \
  -F "title=Algebra Lesson" \
  -F "specialtyId=674f5e8a8b9c1d2e3f4a5b6c"
```

**Validation:**

- Teacher must have the specialty in their profile
- Specialty must exist and be active
- Video file is required

**Response:**

```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "_id": "674f6a1b2c3d4e5f6g7h8i9j",
    "teacher": "674f5e8a8b9c1d2e3f4a5b6c",
    "specialty": "674f5e8a8b9c1d2e3f4a5b6d",
    "title": "Algebra Lesson",
    "videoUrl": "http://localhost:5000/uploads/videos/algebra-1234567890.mp4",
    "uploadedAt": "2024-12-08T11:00:00.000Z"
  }
}
```

---

## 🔍 Filtering Videos by Specialty

### Get Videos with Filters

```http
GET /api/videos?specialtyId=674f5e8a8b9c1d2e3f4a5b6c&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `specialtyId` (optional) - Filter videos by specialty
- `teacherId` (optional) - Filter videos by teacher
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "_id": "...",
        "teacher": {
          "_id": "...",
          "fullName": "Ahmed Ali",
          ...
        },
        "specialty": {
          "_id": "674f5e8a8b9c1d2e3f4a5b6c",
          "name": "Mathematics",
          "nameAr": "الرياضيات"
        },
        "title": "Algebra Lesson",
        "videoUrl": "...",
        "uploadedAt": "2024-12-08T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

## 🌱 Seeding Initial Specialties

Run the seed script to populate initial specialties:

```bash
npm run seed:specialties
```

**This will create:**

- Mathematics (الرياضيات)
- Physics (الفيزياء)
- Chemistry (الكيمياء)
- Biology (الأحياء)
- English Language (اللغة الإنجليزية)
- Arabic Language (اللغة العربية)
- Islamic Studies (التربية الإسلامية)
- History (التاريخ)
- Geography (الجغرافيا)
- Computer Science (علوم الحاسوب)
- Art (الفنون)
- Music (الموسيقى)
- Physical Education (التربية الرياضية)
- French Language (اللغة الفرنسية)
- German Language (اللغة الألمانية)

---

## 🔄 Updated Database Schema

### Teacher Model

```typescript
{
  fullName: string,
  phoneNumber: string,
  password: string,
  nationalID: string,
  gender: 'male' | 'female',
  age: number,
  address: string,
  academicQualification: string,
  diploma?: string,
  courses?: string[],
  specialties: ObjectId[],  // ← NEW: Array of Specialty IDs
  taughtStages: string[],
  workedInOmanBefore: boolean,
  videos: ObjectId[],
  role: 'teacher'
}
```

### Video Model

```typescript
{
  teacher: ObjectId,
  specialty: ObjectId,  // ← NEW: Reference to Specialty
  title: string,
  videoUrl: string,
  uploadedAt: Date
}
```

### Specialty Model (NEW)

```typescript
{
  name: string,           // English name
  nameAr?: string,        // Arabic name
  description?: string,   // Description
  isActive: boolean,      // Active/Inactive status
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚠️ Error Responses

### Specialty Already Exists

```json
{
  "success": false,
  "message": "Specialty already exists"
}
```

### Teacher Missing Specialty

```json
{
  "success": false,
  "message": "You can only upload videos for your registered specialties"
}
```

### Specialty Not Found

```json
{
  "success": false,
  "message": "Specialty not found"
}
```

---

## 🎯 Workflow Example

### Complete Flow for Admin and Teacher

**1. Admin Creates Specialties**

```bash
# Seed initial specialties
npm run seed:specialties

# Or create manually
POST /api/specialties
{
  "name": "Mathematics",
  "nameAr": "الرياضيات"
}
```

**2. Teacher Registers with Specialties**

```bash
POST /api/auth/register/teacher
{
  "fullName": "Ahmed Ali",
  "phoneNumber": "+96812345678",
  "password": "SecurePass123",
  "specialties": ["674f5e8a8b9c1d2e3f4a5b6c"],  # Math ID
  ...
}
```

**3. Teacher Uploads Video for Specialty**

```bash
POST /api/videos/upload
Headers: Authorization: Bearer <teacher-token>
Body (form-data):
  - video: file
  - title: "Algebra Basics"
  - specialtyId: "674f5e8a8b9c1d2e3f4a5b6c"
```

**4. School Filters Videos by Specialty**

```bash
GET /api/videos?specialtyId=674f5e8a8b9c1d2e3f4a5b6c
```

---

## 📝 Summary of Changes

✅ **New Model:** Specialty model created  
✅ **Updated Models:** Teacher and Video models include specialty references  
✅ **New Controller:** specialtyController with CRUD operations  
✅ **New Routes:** `/api/specialties` endpoints  
✅ **Updated Registration:** Teachers must select specialties  
✅ **Updated Video Upload:** Videos must be linked to a specialty  
✅ **Seed Script:** `npm run seed:specialties` to populate initial data  
✅ **Validation:** Teachers can only upload videos for their specialties  
✅ **Filtering:** Videos can be filtered by specialty

---

**All changes are backward compatible and the system is ready to use!** 🚀
