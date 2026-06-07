# File Manager API

A RESTful API for file management built with Node.js, Express, and MongoDB. Supports user authentication, profile management, and file operations.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express v5
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (Access Token)
- **Password Hashing:** bcrypt
- **Validation:** Joi
- **Logging:** Winston
- **Testing:** Jest + Supertest

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/Amoo-Amir/file-manager-api.git
cd file-manager-api

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Start development server
npx nodemon src/server.js
```

### Environment Variables

```env
PORT=3008
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/file-manager

JWT_SECRET=your-strong-random-secret
JWT_EXPIRES_IN=7d
```

> Generate a strong secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## API Reference

Base URL: `http://localhost:3008/api`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login and receive JWT token |

#### POST `/auth/register`

```json
// Request body
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
// Request body
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

### User

All user endpoints require the `Authorization` header:

```
Authorization: Bearer <token>
```

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/profile` | ✅ | Get current user profile |
| PATCH | `/user/update` | ✅ | Update name and phone |
| PATCH | `/user/changepassword` | ✅ | Change password |
| DELETE | `/user/delete` | ✅ | Delete account |

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
// Request body
{
  "fullName": "New Name",
  "phone": "09111111111"
}
```

#### PATCH `/user/changepassword`

```json
// Request body
{
  "OldPass": "securepassword",
  "NewPass": "newpassword123",
  "ConfrimNewPass": "newpassword123"
}
```

#### DELETE `/user/delete`

```json
// Request body — requires confirmation with credentials
{
  "email": "amir@example.com",
  "password": "securepassword"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Validation errors include field-level detail:

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

| Status | Meaning |
|--------|---------|
| 400 | Validation error / bad request |
| 401 | Unauthorized / invalid credentials |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already exists) |
| 500 | Internal server error |

---

## Project Structure

```
src/
├── config/
│   ├── db.js            # MongoDB connection
│   └── env.js           # Environment variables
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   └── file.controller.js
├── middlewares/
│   ├── auth.middleware.js     # JWT verification
│   ├── asyncHandler.js        # Async error wrapper
│   ├── error.middleware.js    # Global error handler
│   └── validate.middleware.js # Joi validation
├── models/
│   ├── user.model.js
│   └── file.model.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── file.routes.js
├── services/
│   ├── auth.service.js
│   └── file.service.js
├── utils/
│   ├── apiError.js      # Custom error class
│   └── logger.js        # Winston logger
├── validations/
│   ├── auth.validation.js
│   └── user.validation.js
├── workers/
│   └── cleanup.worker.js
├── app.js
└── server.js
```

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests are located in `src/tests/` and cover:

- User registration (valid data, missing fields, duplicate email)
- Login (valid credentials, wrong email, wrong password)
- Profile retrieval and update
- Password change
- Account deletion

---

## Roadmap

- [x] User authentication (register / login)
- [x] JWT middleware
- [x] Profile management
- [x] Input validation (Joi)
- [x] Structured logging (Winston)
- [ ] File upload (multer)
- [ ] File download / delete
- [ ] Cleanup worker (expired files)
- [ ] Rate limiting
- [ ] Refresh token
- [ ] Docker support
- [ ] Swagger / OpenAPI docs

---

## License

ISC
