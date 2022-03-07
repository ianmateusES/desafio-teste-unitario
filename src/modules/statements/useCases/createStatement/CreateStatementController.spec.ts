import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
let connection: Connection;

describe("Create statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const passwordHash = await hash("test", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      values('${id}', 'test', 'test@test.com', '${passwordHash}', now(), now())`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a statement with deposit type", async () => {
    const user = {
      name: "test",
      email: "test@test.com",
      password: "test",
    };

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send(user);

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${responseToken.body.token}`)
      .send({
        amount: 700,
        description: "Test deposit statement",
      });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toEqual("deposit");
    expect(response.body.amount).toEqual(700);
  });

  it("should be able to create a statement with withdraw type", async () => {
    const user = {
      name: "test",
      email: "test@test.com",
      password: "test",
    };

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send(user);

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${responseToken.body.token}`)
      .send({
        amount: 700,
        description: "Test withdraw statement",
      });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toEqual("withdraw");
    expect(response.body.amount).toEqual(700);
  });

  it("should not be able to create a statement with withdraw type if funds are insufficient", async () => {
    const user = {
      name: "test",
      email: "test@test.com",
      password: "test",
    };

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send(user);

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${responseToken.body.token}`)
      .send({
        amount: 100,
        description: "Test withdraw statement",
      });

    expect(response.status).toEqual(400);
  });
});
