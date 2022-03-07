import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../enums/OperationTypeEnum";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Get statement operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get statement operation from user", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "test",
      email: "test@test.com",
      password: "test",
    });

    if (!user.id) fail("User ID is probably undefined");

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      description: "Test user balance deposit description",
      amount: 1230,
    });

    if (!statement.id) fail("Statement ID is probably undefined");

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id,
    });

    expect(statementOperation).toEqual(statement);
  });

  it("should not be able to get statement operation from non-existent user", async () => {
    await expect(async () => {
      const statement = await inMemoryStatementsRepository.create({
        user_id: "12345",
        type: OperationType.DEPOSIT,
        description: "Test user balance deposit description",
        amount: 1230,
      });

      if (!statement.id) fail("Statement ID is probably undefined");

      await getStatementOperationUseCase.execute({
        user_id: "12345",
        statement_id: statement.id,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get non-existent statement operation from user", async () => {
    await expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "test",
        email: "test@test.com",
        password: "test",
      });

      if (!user.id) fail("User ID is probably undefined");

      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: "12345",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
