import { User } from "../../entity/User";
import { request } from "graphql-request";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from "./errorMessages";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Connection } from "typeorm";
import { registerMutation } from "../../testSetup/mutations";

const host = (process.env.TEST_HOST as string) + "/graphql";
let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
});

afterAll(() => conn.close());

describe("Register", () => {
  const email: string = "tom@bob.com";
  const password: string = "aoeuaoeuaoeu";

  test("Register user", async () => {
    const response = await request<REGISTER.register>(
      host,
      registerMutation(email, password),
    );

    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  test("Register a user with the same email", async () => {
    const response = await request<REGISTER.registerError>(
      host,
      registerMutation(email, password),
    );

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: duplicateEmail,
    });
  });

  test("Catch non emails", async () => {
    const response = await request<REGISTER.registerError>(
      host,
      registerMutation("bad", password),
    );

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: invalidEmail,
    });
  });

  test("Catch short emails", async () => {
    const response = await request<REGISTER.registerError>(
      host,
      registerMutation("b", password),
    );

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: emailNotLongEnough,
    });
  });

  test("Catch short passwords", async () => {
    const response = await request<REGISTER.registerError>(
      host,
      registerMutation(email, "1"),
    );

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "password",
      message: passwordNotLongEnough,
    });
  });
});
