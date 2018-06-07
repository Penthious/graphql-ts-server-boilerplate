import { User } from "../../entity/User";
import { request } from "graphql-request";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from "./errorMessages";
import { createTypeormConn } from "../../utils/createTypeormConn";

const host = (process.env.TEST_HOST as string) + "/graphql";

beforeAll(async () => {
  await createTypeormConn();
});

describe("Register", () => {
  const email: string = "tom@bob.com";
  const password: string = "aoeuaoeuaoeu";

  const mutation = (email: string, password: string) => `
  mutation {
    register(email: "${email}", password: "${password}"){
      path
      message
    }
  }
  `;

  test("Register user", async () => {
    const response = await request<register>(host, mutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  test("Register a user with the same email", async () => {
    const response = await request<registerError>(
      host,
      mutation(email, password),
    );

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: duplicateEmail,
    });
  });

  test("Catch non emails", async () => {
    const response = await request<registerError>(
      host,
      mutation("bad", password),
    );

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: invalidEmail,
    });
  });

  test("Catch short emails", async () => {
    const response = await request<registerError>(
      host,
      mutation("b", password),
    );

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: emailNotLongEnough,
    });
  });

  test("Catch short passwords", async () => {
    const response = await request<registerError>(host, mutation(email, "1"));

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "password",
      message: passwordNotLongEnough,
    });
  });
});
