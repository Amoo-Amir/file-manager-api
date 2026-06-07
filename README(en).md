# 📁 File Manager API

یک API آماده برای محیط production جهت مدیریت امن فایل‌ها، ساخته‌شده با **Node.js**، **Express v5** و **MongoDB**. این پروژه شامل احراز هویت مبتنی بر JWT، مدیریت کامل پروفایل کاربر، آپلود/دانلود/حذف فایل، حذف نرم‌افزاری (soft-delete) با پاک‌سازی خودکار، و پشتیبانی از Docker می‌باشد.

---

## ✨ ویژگی‌ها

- 🔐 احراز هویت JWT (ثبت‌نام و ورود)
- 👤 مدیریت پروفایل کاربر (مشاهده، ویرایش، تغییر رمز، حذف حساب)
- 📤 آپلود فایل با دسته‌بندی خودکار بر اساس نوع MIME
- 📥 دانلود فایل و مشاهده لیست فایل‌های هر کاربر
- 🗑️ حذف نرم‌افزاری (soft-delete) با worker پاک‌سازی (هر ۲۴ ساعت)
- ✅ اعتبارسنجی درخواست‌ها با Joi
- 📋 لاگ‌گیری ساختارمند با Winston
- 🧪 تست‌های یکپارچه با Jest و Supertest
- 🐳 پشتیبانی از Docker و Docker Compose

---

## 🛠 تکنولوژی‌های استفاده‌شده

| لایه | تکنولوژی |
|---|---|
| Runtime | Node.js v18+ |
| فریمورک | Express v5 |
| پایگاه داده | MongoDB + Mongoose |
| احراز هویت | JWT (jsonwebtoken) |
| هش رمز عبور | bcrypt |
| آپلود فایل | Multer |
| اعتبارسنجی | Joi |
| لاگ‌گیری | Winston |
| تست | Jest + Supertest |
| کانتینرسازی | Docker + Docker Compose |

---

## 🚀 شروع به کار

### پیش‌نیازها

- Node.js نسخه ۱۸ یا بالاتر
- MongoDB (محلی یا Atlas)

### نصب محلی

```bash
# ۱. کلون کردن مخزن
git clone https://github.com/Amoo-Amir/file-manager-api.git
cd file-manager-api

# ۲. نصب وابستگی‌ها
npm install

# ۳. تنظیم متغیرهای محیطی
cp .env.example .env
# فایل .env را با مقادیر خود ویرایش کنید

# ۴. اجرای سرور در محیط توسعه
npm run dev
```

### اجرا با Docker

```bash
docker-compose up --build
```

این دستور هم سرور API (پورت `3008`) و هم یک نمونه MongoDB (پورت `27017`) با ذخیره‌سازی پایدار را راه‌اندازی می‌کند.

---

## ⚙️ متغیرهای محیطی

```env
PORT=3008
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/file-manager

JWT_SECRET=یک-رشته-تصادفی-قوی
JWT_EXPIRES_IN=7d
```

> 💡 تولید یک secret قوی:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 📡 مستندات API

**آدرس پایه:** `http://localhost:3008/api`

تمام endpoint‌های محافظت‌شده نیاز به هدر زیر دارند:
```
Authorization: Bearer <token>
```

---

### 🔑 احراز هویت (Auth)

| متد | مسیر | نیاز به احراز هویت | توضیح |
|-----|------|:---:|-------|
| POST | `/auth/register` | ❌ | ثبت‌نام کاربر جدید |
| POST | `/auth/login` | ❌ | ورود و دریافت توکن JWT |

#### POST `/auth/register`

```json
// درخواست
{
  "fullName": "امیر مهدی",
  "email": "amir@example.com",
  "password": "securepassword",
  "phone": "09123456789"
}

// پاسخ 201
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "...",
    "fullName": "امیر مهدی",
    "email": "amir@example.com",
    "phone": "09123456789"
  }
}
```

#### POST `/auth/login`

```json
// درخواست
{
  "email": "amir@example.com",
  "password": "securepassword"
}

// پاسخ 200
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "fullName": "امیر مهدی",
    "email": "amir@example.com",
    "role": "user"
  }
}
```

---

### 👤 کاربر (User)

| متد | مسیر | نیاز به احراز هویت | توضیح |
|-----|------|:---:|-------|
| GET | `/user/profile` | ✅ | دریافت پروفایل کاربر جاری |
| PATCH | `/user/update` | ✅ | به‌روزرسانی نام و شماره تلفن |
| PATCH | `/user/changepassword` | ✅ | تغییر رمز عبور |
| DELETE | `/user/delete` | ✅ | حذف حساب کاربری (نیاز به تأیید اعتبار) |

#### GET `/user/profile`

```json
// پاسخ 200
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "...",
    "fullName": "امیر مهدی",
    "email": "amir@example.com",
    "phone": "09123456789",
    "role": "user"
  }
}
```

#### PATCH `/user/update`

```json
// درخواست
{
  "fullName": "نام جدید",
  "phone": "09111111111"
}
```

#### PATCH `/user/changepassword`

```json
// درخواست
{
  "OldPass": "securepassword",
  "NewPass": "newpassword123",
  "ConfrimNewPass": "newpassword123"
}
```

#### DELETE `/user/delete`

```json
// درخواست — نیاز به تأیید اعتبار برای حذف
{
  "email": "amir@example.com",
  "password": "securepassword"
}
```

---

### 📁 فایل‌ها (Files)

| متد | مسیر | نیاز به احراز هویت | توضیح |
|-----|------|:---:|-------|
| POST | `/files/upload` | ✅ | آپلود فایل |
| GET | `/files` | ✅ | لیست تمام فایل‌های کاربر جاری |
| GET | `/files/:id/download` | ✅ | دانلود فایل با شناسه |
| DELETE | `/files/:id` | ✅ | حذف نرم‌افزاری فایل با شناسه |

#### POST `/files/upload`

درخواست باید به‌صورت `multipart/form-data` با فیلد `file` ارسال شود.

فایل‌ها به‌صورت خودکار بر اساس نوع MIME دسته‌بندی می‌شوند:

| دسته‌بندی | نوع‌های MIME |
|----------|------------|
| `image` | `image/*` |
| `document` | `application/pdf`، `text/plain` |
| `archive` | `application/zip`، `application/x-rar-compressed` |
| `other` | سایر موارد |

```json
// پاسخ 201
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

تمام فایل‌های حذف‌نشده متعلق به کاربر احراز هویت‌شده را برمی‌گرداند.

#### GET `/files/:id/download`

فایل را به‌صورت stream برای دانلود ارسال می‌کند.

#### DELETE `/files/:id`

فایل را به‌صورت نرم‌افزاری حذف می‌کند (`isDeleted: true` و `deletedAt: <timestamp>`). حذف فیزیکی فایل توسط worker پاک‌سازی در پس‌زمینه انجام می‌شود.

---

## ❌ پاسخ‌های خطا

تمام خطاها از یک قالب یکسان پیروی می‌کنند:

```json
{
  "success": false,
  "message": "توضیح خطا"
}
```

خطاهای اعتبارسنجی شامل جزئیات فیلدها هستند:

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

| کد وضعیت | معنا |
|----------|------|
| 400 | خطای اعتبارسنجی / درخواست نادرست |
| 401 | احراز هویت نشده / اعتبارسنجی نادرست |
| 403 | دسترسی ممنوع |
| 404 | منبع یافت نشد |
| 409 | تعارض (مثلاً ایمیل تکراری) |
| 500 | خطای داخلی سرور |

---

## 📂 ساختار پروژه

```
src/
├── config/
│   ├── db.js                  # اتصال به MongoDB
│   ├── env.js                 # بارگذاری متغیرهای محیطی
│   └── multer.js              # تنظیمات ذخیره‌سازی Multer
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   └── file.controller.js
├── middlewares/
│   ├── auth.middleware.js     # تأیید توکن JWT
│   ├── asyncHandler.js        # پوشش خطاهای async
│   ├── error.middleware.js    # هندلر سراسری خطا
│   ├── upload.middleware.js   # هندلر آپلود Multer
│   └── validate.middleware.js # اعتبارسنجی Joi
├── models/
│   ├── user.model.js
│   └── file.model.js          # شامل soft-delete و دسته‌بندی خودکار
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
│   ├── apiError.js            # کلاس خطای سفارشی
│   └── logger.js              # تنظیمات Winston
├── validations/
│   ├── auth.validation.js
│   └── user.validation.js
├── workers/
│   └── cleanup.worker.js      # پاک‌سازی فایل‌های حذف‌شده هر ۲۴ ساعت
├── app.js
└── server.js
```

---

## 🧪 تست‌ها

```bash
# اجرای تمام تست‌ها
npm test

# حالت watch
npm run test:watch
```

پوشش تست‌ها شامل موارد زیر است:

- ثبت‌نام کاربر (داده معتبر، فیلدهای ناقص، ایمیل تکراری)
- ورود (اعتبارسنجی صحیح، ایمیل اشتباه، رمز اشتباه)
- دریافت و به‌روزرسانی پروفایل
- تغییر رمز عبور
- حذف حساب کاربری
- آپلود، لیست، دانلود و حذف فایل

---

## 🗺 نقشه راه

- [x] احراز هویت JWT (ثبت‌نام / ورود)
- [x] میدلور JWT
- [x] مدیریت پروفایل (مشاهده، ویرایش، حذف)
- [x] تغییر رمز عبور
- [x] اعتبارسنجی ورودی (Joi)
- [x] لاگ‌گیری ساختارمند (Winston)
- [x] آپلود فایل (Multer)
- [x] لیست و دانلود فایل
- [x] حذف نرم‌افزاری و worker پاک‌سازی
- [x] Docker و Docker Compose
- [ ] محدودسازی نرخ درخواست (Rate Limiting)
- [ ] پشتیبانی از Refresh Token
- [ ] مستندات Swagger / OpenAPI
- [ ] اشتراک‌گذاری فایل بین کاربران

---

## 📄 مجوز

ISC
