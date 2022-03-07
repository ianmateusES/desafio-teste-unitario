import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const user = {
      name: "Test",
      email: "test@test.com",
      password: "test",
    };

    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({});
  });

  it("should not be able to create a new user if email already exists", async () => {
    const user = {
      name: "Test",
      email: "test@test.com",
      password: "test",
    };

    await request(app).post("/api/v1/users").send(user);
    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");
  });
});
