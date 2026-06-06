const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

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
});

describe("POST /api/auth/Login", () => {
  test("testing login with true info", async () => {
    const userData = {
      fullName: "amirmahdi",
      email: "amir1@gmail.com",
      phone: 9123456789,
      password: "12345678",
    };

    const register =await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

  

    const login_response = await request(app)
    .post("/api/auth/login")
    .send(userData)
    .expect(200)

    expect(login_response.body.success).toBe(true);
  });
});
