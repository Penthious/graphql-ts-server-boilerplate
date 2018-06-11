import { Connection } from "typeorm";

import TestClient from "../../../testSetup/testCLient";
import { User } from "../../../entity/User";
import { createTypeormConn } from "../../../utils/createTypeormConn";
import { invalidLogin, confirmEmailError } from "./errorMessages";

const host = (process.env.TEST_HOST as string) + "/graphql";
const email: string = "tom@bob.com";
const password: string = "aoeuaoeuaoeu";
const client = new TestClient(host);

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
  await client.createUser();
});

afterAll(() => conn.close());

describe("login", () => {
  test("fails if no user is found", async () => {
    const response = (await client.login(
      "no_user@false.com",
      password,
    )) as LOGIN.loginError;

    expect(response.data.login).toEqual([
      {
        path: "email/password",
        message: invalidLogin,
      },
    ]);
  });

  test("fails if user is found but password is wrong", async () => {
    const response = (await client.login(
      email,
      "FAIL_PASSWORD",
    )) as LOGIN.loginError;

    expect(response.data.login).toEqual([
      {
        path: "email/password",
        message: invalidLogin,
      },
    ]);
  });

  test("fails if user logs in correctly but confirmed is false", async () => {
    await User.update({ email }, { confirmed: false });
    const response = (await client.login(email, password)) as LOGIN.loginError;

    expect(response.data.login).toEqual([
      {
        path: "email",
        message: confirmEmailError,
      },
    ]);
  });

  test("User can login", async () => {
    await User.update({ email }, { confirmed: true });

    const response = (await client.login(email, password)) as LOGIN.login;

    expect(response.data.login).toEqual(null);
  });
});
