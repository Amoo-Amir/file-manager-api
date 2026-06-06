const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/user.model");


beforeAll(async () => {
  process.env.SECRET_KEY = "test-jwt-secret";
  const testDBUri = "mongodb://localhost:27017/test_db";
  await mongoose.connect(testDBUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /api/auth/register", () => {
  test("register user as 'user' role(no secret key)", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.password).not.toBe(userData.password);

    const User = require("../models/user.model");
    const savedUser = await User.findOne({
      email: userData.email.toLowerCase(),
    });
    expect(savedUser).toBeTruthy();
    expect(savedUser.role).toBe("user");
    expect(savedUser.password).not.toBe(userData.password);
  });

  test("Register with empty fildes", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "",
      phone: "",
      password: "12345678",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send(userData)
      .expect(400);

    console.log(response.body);
    expect(response.body.message).toBe("Missing required fields");
    expect(response.body.password).not.toBe(userData.password);

    const User = require("../models/user.model");

    const savedUser = await User.findOne({
      email: userData.email.toLowerCase(),
    });

    expect(savedUser).not.toBeTruthy();
  });

  test("register exists user.", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.password).not.toBe(userData.password);

    const User = require("../models/user.model");
    const savedUser = await User.findOne({
      email: userData.email.toLowerCase(),
    });
    expect(savedUser).toBeTruthy();

    const existsuser = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(409);

    expect(existsuser.body.message).toBe("User already exists");
  });
});

describe("POST /api/auth/Login", () => {
  test("testing login with true info", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const register = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    const login_response = await request(app)
      .post("/api/auth/login")
      .send(userData)
      .expect(200);

    expect(login_response.body.success).toBe(true);
  });

  test("login with empty fileds", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const userData2 = {
      fullName: "amirmahdi",
      email: "",
      phone: 9123456789,
      password: "",
    };
    const register = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    const login_response = await request(app)
      .post("/api/auth/login")
      .send(userData2)
      .expect(400);

    expect(login_response.body.success).toBe(false);
  });

  test("login with wrong email", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const userData2 = {
      fullName: "amirmahdi",
      email: "amir221@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const register = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    const login_response = await request(app)
      .post("/api/auth/login")
      .send(userData2)
      .expect(404);

    expect(login_response.body.success).toBe(false);
  });

  test("login with wrong password", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const userData2 = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "9998653215",
    };

    const register = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    const login_response = await request(app)
      .post("/api/auth/login")
      .send(userData2)
      .expect(401);

    expect(login_response.body.success).toBe(false);
  });
});

describe("Get /api/user/profile", () => {
  test("get profile", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const register = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    const login_response = await request(app)
      .post("/api/auth/login")
      .send(userData)
      .expect(200);

    expect(login_response.body.success).toBe(true);

    const logintoken = login_response.body.token;

    console.log("LOGIN RESPONSE:", login_response.body);
    console.log("TOKEN:", logintoken);

    const getProfile = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${logintoken}`)
      .expect(200);

    expect(getProfile.body.success).toBe(true);
  });
});

describe("PATCH /api/user/update", () => {
  test("update profile", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const register = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    const login_response = await request(app)
      .post("/api/auth/login")
      .send(userData)
      .expect(200);

    expect(login_response.body.success).toBe(true);

    const logintoken = login_response.body.token;

    const updateData = {
      fullName: "new name",
      phone: 123456789,
    };
    const updateRes = await request(app)
      .patch("/api/user/update")
      .set("Authorization", `Bearer ${logintoken}`)
      .send(updateData)
      .expect(200);
  });
});

describe("PATCH /api/user/changepassword", () => {
  test("change password testing true info", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const register = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    const login_response = await request(app)
      .post("/api/auth/login")
      .send(userData)
      .expect(200);

    expect(login_response.body.success).toBe(true);

    const change_passwordData = {
      OldPass: "12345678",
      NewPass: "987654321",
      ConfrimNewPass: "987654321",
    };

    const logintoken = login_response.body.token;

    const changepassRes = await request(app)
      .patch("/api/user/changepassword")
      .send(change_passwordData)
      .set("Authorization", `Bearer ${logintoken}`);

    expect(login_response.status).toBe(200);
  });
});

describe("DELETE /api/user/delete", () => {
  test("", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const register = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    const login_response = await request(app)
      .post("/api/auth/login")
      .send(userData)
      .expect(200);

    expect(login_response.body.success).toBe(true);

    const logintoken = login_response.body.token;

    const deleteAccount_Data = {
      email: "amir1@gmail.com",
      password: "12345678",
    };
    const deleteAccount = await request(app)
      .delete("/api/user/delete")
      .set("Authorization", `Bearer ${logintoken}`)
      .send(deleteAccount_Data)
      .expect(200);

    console.log(deleteAccount.status);
    console.log(deleteAccount.body);
  });
});
