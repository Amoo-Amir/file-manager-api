
const request = require("supertest");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const app = require("../app");
const User = require("../models/user.model");
const File = require("../models/file.model");



const TEST_DB = "mongodb://localhost:27017/file_manager_test";

const TEST_USER = {
  fullName: "Amir Mahdi",
  email: "amir@test.com",
  phone: "09123456789",
  password: "12345678",
};

const TEMP_FILE_PATH = path.join(__dirname, "temp_test_file.txt");
const TEMP_PDF_PATH  = path.join(__dirname, "temp_test_file.pdf");

const createTempFiles = () => {
  fs.writeFileSync(TEMP_FILE_PATH, "this is a test file content");
  fs.writeFileSync(TEMP_PDF_PATH,  "%PDF-1.4 test pdf content");
};

const removeTempFiles = () => {
  if (fs.existsSync(TEMP_FILE_PATH)) fs.unlinkSync(TEMP_FILE_PATH);
  if (fs.existsSync(TEMP_PDF_PATH))  fs.unlinkSync(TEMP_PDF_PATH);
};

const registerAndLogin = async (userData = TEST_USER) => {
  await request(app).post("/api/auth/register").send(userData);
  const res = await request(app).post("/api/auth/login").send({
    email: userData.email,
    password: userData.password,
  });
  return res.body.token;
};


beforeAll(async () => {
  await mongoose.connect(TEST_DB);
  createTempFiles();
});

afterEach(async () => {
  // بعد از هر تست همه collection ها رو خالی کن
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  // فایل‌های آپلودشده روی disk رو هم پاک کن
  const uploadsDir = path.join(__dirname, "../../uploads");
  if (fs.existsSync(uploadsDir)) {
    fs.readdirSync(uploadsDir).forEach((file) => {
      fs.unlinkSync(path.join(uploadsDir, file));
    });
  }
});

afterAll(async () => {
  removeTempFiles();
  await mongoose.disconnect();
});


describe("POST /api/files/upload", () => {
  test("success txt file upload", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", TEMP_FILE_PATH)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      originalName: "temp_test_file.txt",
      mimetype: "text/plain",
      category: "document",
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.size).toBeGreaterThan(0);

    // مطمئن شو توی DB ذخیره شده
    const saved = await File.findById(res.body.data.id);
    expect(saved).toBeTruthy();
    expect(saved.originalName).toBe("temp_test_file.txt");
  });

  test("upload without token 401", async () => {
    const res = await request(app)
      .post("/api/files/upload")
      .expect(401);

    expect(res.body.message).toBeDefined();
  });

  test("upload with out file ", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No file provided");
  });

  test("upload not allowed file", async () => {
    const token = await registerAndLogin();

    // یه فایل exe موقت بساز
    const exePath = path.join(__dirname, "test.exe");
    fs.writeFileSync(exePath, "fake exe content");

    const res = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", exePath)
      .expect(400);

    expect(res.body.success).toBe(false);

    fs.unlinkSync(exePath);
  });

  test("uploaded file is for owner", async () => {
    const token = await registerAndLogin();

    const uploadRes = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", TEMP_FILE_PATH)
      .expect(201);

    const fileId = uploadRes.body.data.id;
    const file = await File.findById(fileId);

    // پیدا کن userId از token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(file.owner.toString()).toBe(loginRes.body.user._id);
  });
});



describe("GET /api/files", () => {
  test("لیست فایل‌های کاربر لاگین‌کرده", async () => {
    const token = await registerAndLogin();

    // سه فایل آپلود کن
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post("/api/files/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", TEMP_FILE_PATH);
    }

    const res = await request(app)
      .get("/api/files")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.pagination).toMatchObject({
      total: 3,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
  });

  test("pagination درست کار می‌کنه", async () => {
    const token = await registerAndLogin();

    // ۵ فایل آپلود کن
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/files/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", TEMP_FILE_PATH);
    }

    // صفحه اول — ۲ تا ۲ تا
    const page1 = await request(app)
      .get("/api/files?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(page1.body.data).toHaveLength(2);
    expect(page1.body.pagination).toMatchObject({
      total: 5,
      page: 1,
      limit: 2,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: false,
    });

    // صفحه سوم
    const page3 = await request(app)
      .get("/api/files?page=3&limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(page3.body.data).toHaveLength(1);
    expect(page3.body.pagination.hasPrevPage).toBe(true);
    expect(page3.body.pagination.hasNextPage).toBe(false);
  });

  test("فیلتر category درست کار می‌کنه", async () => {
    const token = await registerAndLogin();

    // یه txt (document) و یه pdf (document) آپلود کن
    await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", TEMP_FILE_PATH);

    await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", TEMP_PDF_PATH);

    const res = await request(app)
      .get("/api/files?category=document")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((file) => {
      expect(file.category).toBe("document");
    });
  });

  test("category نامعتبر باید 400 برگردونه", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/files?category=video")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  test("کاربر فقط فایل‌های خودش رو می‌بینه", async () => {
    // کاربر اول
    const token1 = await registerAndLogin({
      fullName: "User One",
      email: "user1@test.com",
      phone: "09111111111",
      password: "12345678",
    });

    // کاربر دوم
    const token2 = await registerAndLogin({
      fullName: "User Two",
      email: "user2@test.com",
      phone: "09222222222",
      password: "12345678",
    });

    // کاربر اول ۲ فایل آپلود می‌کنه
    for (let i = 0; i < 2; i++) {
      await request(app)
        .post("/api/files/upload")
        .set("Authorization", `Bearer ${token1}`)
        .attach("file", TEMP_FILE_PATH);
    }

    // کاربر دوم ۱ فایل آپلود می‌کنه
    await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token2}`)
      .attach("file", TEMP_FILE_PATH);

    // کاربر دوم فقط فایل خودش رو ببینه
    const res = await request(app)
      .get("/api/files")
      .set("Authorization", `Bearer ${token2}`)
      .expect(200);

    expect(res.body.pagination.total).toBe(1);
  });

  test("بدون token باید 401 برگردونه", async () => {
    await request(app).get("/api/files").expect(401);
  });
});

// ─── GET /api/files/:id/download ─────────────────────────────────────────────

describe("GET /api/files/:id/download", () => {
  test("دانلود موفق فایل", async () => {
    const token = await registerAndLogin();

    const uploadRes = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", TEMP_FILE_PATH)
      .expect(201);

    const fileId = uploadRes.body.data.id;

    const res = await request(app)
      .get(`/api/files/${fileId}/download`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // header های دانلود درست باشن
    expect(res.headers["content-disposition"]).toContain("attachment");
    expect(res.headers["content-disposition"]).toContain("temp_test_file.txt");
    expect(res.headers["content-type"]).toContain("text/plain");
  });

  test("دانلود فایل کاربر دیگه باید 404 برگردونه", async () => {
    const token1 = await registerAndLogin({
      fullName: "User One",
      email: "user1@test.com",
      phone: "09111111111",
      password: "12345678",
    });

    const token2 = await registerAndLogin({
      fullName: "User Two",
      email: "user2@test.com",
      phone: "09222222222",
      password: "12345678",
    });

    // کاربر اول فایل آپلود کنه
    const uploadRes = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token1}`)
      .attach("file", TEMP_FILE_PATH)
      .expect(201);

    const fileId = uploadRes.body.data.id;

    // کاربر دوم سعی کنه دانلود کنه
    const res = await request(app)
      .get(`/api/files/${fileId}/download`)
      .set("Authorization", `Bearer ${token2}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  test("id نامعتبر باید 404 برگردونه", async () => {
    const token = await registerAndLogin();

    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/files/${fakeId}/download`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  test("بدون token باید 401 برگردونه", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app).get(`/api/files/${fakeId}/download`).expect(401);
  });
});

// ─── DELETE /api/files/:id ────────────────────────────────────────────────────

describe("DELETE /api/files/:id", () => {
  test("حذف موفق فایل — soft delete", async () => {
    const token = await registerAndLogin();

    const uploadRes = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", TEMP_FILE_PATH)
      .expect(201);

    const fileId = uploadRes.body.data.id;

    const res = await request(app)
      .delete(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("File deleted successfully");

    // مطمئن شو توی DB isDeleted شده — bypass کن pre(/^find/)
    const deleted = await File.findOne({ _id: fileId, isDeleted: true });
    expect(deleted).toBeTruthy();
    expect(deleted.deletedAt).not.toBeNull();
  });

  test("file deleted and shuoldnt exists in list ", async () => {
    const token = await registerAndLogin();

    // دو فایل آپلود کن
    const upload1 = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", TEMP_FILE_PATH)
      .expect(201);

    await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", TEMP_FILE_PATH);

    // اولی رو حذف کن
    await request(app)
      .delete(`/api/files/${upload1.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // لیست باید فقط یکی داشته باشه
    const listRes = await request(app)
      .get("/api/files")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(listRes.body.pagination.total).toBe(1);
    const ids = listRes.body.data.map((f) => f.id);
    expect(ids).not.toContain(upload1.body.data.id);
  });

  test("حذف فایل کاربر دیگه باید 404 برگردونه", async () => {
    const token1 = await registerAndLogin({
      fullName: "User One",
      email: "user1@test.com",
      phone: "09111111111",
      password: "12345678",
    });

    const token2 = await registerAndLogin({
      fullName: "User Two",
      email: "user2@test.com",
      phone: "09222222222",
      password: "12345678",
    });

    const uploadRes = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token1}`)
      .attach("file", TEMP_FILE_PATH)
      .expect(201);

    const fileId = uploadRes.body.data.id;

    // کاربر دوم سعی کنه حذف کنه
    const res = await request(app)
      .delete(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${token2}`)
      .expect(404);

    expect(res.body.success).toBe(false);

    // فایل هنوز توی DB باشه و حذف نشده باشه
    const file = await File.findById(fileId);
    expect(file).toBeTruthy();
    expect(file.isDeleted).toBe(false);
  });

  test("حذف دوباره فایل قبلاً حذف‌شده باید 404 برگردونه", async () => {
    const token = await registerAndLogin();

    const uploadRes = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", TEMP_FILE_PATH)
      .expect(201);

    const fileId = uploadRes.body.data.id;

    // اول حذف کن
    await request(app)
      .delete(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // دوباره سعی کن حذف کنی — pre(/^find/) این رو invisible کرده
    const res = await request(app)
      .delete(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  test("بدون token باید 401 برگردونه", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app).delete(`/api/files/${fakeId}`).expect(401);
  });
});