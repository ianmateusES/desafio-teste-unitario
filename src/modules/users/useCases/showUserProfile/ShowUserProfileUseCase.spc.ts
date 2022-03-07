import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "test",
      email: "test@test.com",
      password: "test",
    });

    if (!user.id) return;

    const profile = await showUserProfileUseCase.execute(user.id);

    expect(profile.id).toEqual(user.id);
  });

  it("should not be able to show user profile from non-existent user", async () => {
    await expect(async () => {
      await showUserProfileUseCase.execute("12345");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
