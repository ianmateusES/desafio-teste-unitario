import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
let connection: Connection;

describe("Get statement operation controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const passwordHash = await hash("test", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      values('${id}', 'test', 'test@test.com', '${passwordHash}', now(), now())
    `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to get statement operation from user", async () => {
    const user = {
      name: "test",
      email: "test@test.com",
      password: "test",
    };

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send(user);

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${responseToken.body.token}`)
      .send({
        amount: 700,
        description: "Test deposit statement",
      });

    const { id } = responseStatement.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set("Authorization", `Bearer ${responseToken.body.token}`);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toEqual("deposit");
  });
});
