import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test",
      email: "test@test.com",
      password: "test",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a new user if email already exists", async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        name: "Test",
        email: "test@test.com",
        password: "test",
      });

      await createUserUseCase.execute({
        name: "Test",
        email: "test@test.com",
        password: "test",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
