# 📁 File Manager API

A production-ready RESTful API for secure file management, built with **Node.js**, **Express v5**, and **MongoDB**. Supports JWT-based authentication, full user profile management, file upload/download/delete, soft-delete with automatic cleanup, and Docker deployment.

---

## ✨ Features

- 🔐 JWT authentication (register & login)
- 👤 User profile management (view, update, change password, delete account)
- 📤 File upload with MIME-type categorization (image, document, archive, other)
- 📥 File download & per-user file listing
- 🗑️ Soft-delete with a background cleanup worker (runs every 24h)
- ✅ Request validation via Joi
- 📋 Structured logging via Winston
- 🧪 Integration tests with Jest + Supertest
- 🐳 Docker & Docker Compose support

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express v5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| File Upload | Multer |
| Validation | Joi |
| Logging | Winston |
| Testing | Jest + Supertest |
| Containerization | Docker + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/Amoo-Amir/file-manager-api.git
cd file-manager-api

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start the development server
npm run dev
```

### Run with Docker

```bash
docker-compose up --build
```

This will spin up both the API server (port `3008`) and a MongoDB instance (port `27017`) with persistent storage.

---

## ⚙️ Environment Variables

```env
PORT=3008
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/file-manager

JWT_SECRET=your-strong-random-secret
JWT_EXPIRES_IN=7d
```

> 💡 Generate a strong secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 📡 API Reference

**Base URL:** `http://localhost:3008/api`

All protected endpoints require the following header:
```
Authorization: Bearer <token>
```

---

### 🔑 Auth

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login and receive a JWT token |

#### POST `/auth/register`

```json
// Request
{
  "fullName": "Amir Mahdi",
  "email": "amir@example.com",
  "password": "securepassword",
  "phone": "09123456789"
}

// Response 201
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "...",
    "fullName": "Amir Mahdi",
    "email": "amir@example.com",
    "phone": "09123456789"
  }
}
```

#### POST `/auth/login`

```json
// Request
{
  "email": "amir@example.com",
  "password": "securepassword"
}

// Response 200
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "fullName": "Amir Mahdi",
    "email": "amir@example.com",
    "role": "user"
  }
}
```

---

### 👤 User

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/user/profile` | ✅ | Get current user's profile |
| PATCH | `/user/update` | ✅ | Update name and phone |
| PATCH | `/user/changepassword` | ✅ | Change password |
| DELETE | `/user/delete` | ✅ | Delete account (requires credentials) |

#### GET `/user/profile`

```json
// Response 200
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "...",
    "fullName": "Amir Mahdi",
    "email": "amir@example.com",
    "phone": "09123456789",
    "role": "user"
  }
}
```

#### PATCH `/user/update`

```json
// Request
{
  "fullName": "New Name",
  "phone": "09111111111"
}
```

#### PATCH `/user/changepassword`

```json
// Request
{
  "OldPass": "securepassword",
  "NewPass": "newpassword123",
  "ConfrimNewPass": "newpassword123"
}
```

#### DELETE `/user/delete`

```json
// Request — credentials required for confirmation
{
  "email": "amir@example.com",
  "password": "securepassword"
}
```

---

### 📁 Files

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/files/upload` | ✅ | Upload a file |
| GET | `/files` | ✅ | List all files for the current user |
| GET | `/files/:id/download` | ✅ | Download a file by ID |
| DELETE | `/files/:id` | ✅ | Soft-delete a file by ID |

#### POST `/files/upload`

Send as `multipart/form-data` with a `file` field.

Files are automatically categorized by MIME type:

| Category | MIME Types |
|----------|-----------|
| `image` | `image/*` |
| `document` | `application/pdf`, `text/plain` |
| `archive` | `application/zip`, `application/x-rar-compressed` |
| `other` | Everything else |

```json
// Response 201
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "...",
    "originalName": "report.pdf",
    "size": 204800,
    "mimetype": "application/pdf",
    "category": "document"
  }
}
```

#### GET `/files`

Returns all non-deleted files owned by the authenticated user.

#### GET `/files/:id/download`

Streams the file as a download response.

#### DELETE `/files/:id`

Marks the file as deleted (`isDeleted: true`, `deletedAt: <timestamp>`). The physical file is removed by the background cleanup worker.

---

## ❌ Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Validation errors include field-level details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Validation error / bad request |
| 401 | Unauthorized / invalid credentials |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already exists) |
| 500 | Internal server error |

---

## 📂 Project Structure

```
src/
├── config/
│   ├── db.js                  # MongoDB connection
│   ├── env.js                 # Environment variable loader
│   └── multer.js              # Multer storage configuration
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   └── file.controller.js
├── middlewares/
│   ├── auth.middleware.js     # JWT verification
│   ├── asyncHandler.js        # Async error wrapper
│   ├── error.middleware.js    # Global error handler
│   ├── upload.middleware.js   # Multer upload handler
│   └── validate.middleware.js # Joi request validation
├── models/
│   ├── user.model.js
│   └── file.model.js          # Includes soft-delete & auto-category
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── file.routes.js
├── services/
│   ├── auth.service.js
│   └── file.service.js
├── tests/
│   ├── auth.test.js
│   └── file.test.js
├── utils/
│   ├── apiError.js            # Custom error class
│   └── logger.js              # Winston logger setup
├── validations/
│   ├── auth.validation.js
│   └── user.validation.js
├── workers/
│   └── cleanup.worker.js      # Deletes soft-deleted files every 24h
├── app.js
└── server.js
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Test coverage includes:

- User registration (valid data, missing fields, duplicate email)
- Login (valid credentials, wrong email, wrong password)
- Profile retrieval and update
- Password change
- Account deletion
- File upload, listing, download, and deletion

---

## 🗺 Roadmap

- [x] JWT authentication (register / login)
- [x] JWT middleware
- [x] Profile management (view, update, delete)
- [x] Password change
- [x] Input validation (Joi)
- [x] Structured logging (Winston)
- [x] File upload (Multer)
- [x] File listing & download
- [x] Soft-delete & cleanup worker
- [x] Docker & Docker Compose
- [ ] Rate limiting
- [ ] Refresh token support
- [ ] Swagger / OpenAPI documentation
- [ ] File sharing between users

---

## 📄 License

ISC
