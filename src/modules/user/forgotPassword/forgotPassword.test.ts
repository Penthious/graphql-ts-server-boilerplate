import { Connection } from "typeorm";

import TestClient from "../../../testSetup/testCLient";
import { accountLocked } from "../login/errorMessages";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { createTypeormConn } from "../../../utils/createTypeormConn";
import { expiredKeyError } from "./errorMessages";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { passwordNotLongEnough } from "../register/errorMessages";
import { redis } from "../../../redis";

const host: string = (process.env.TEST_HOST as string) + "/graphql";
const password: string = "password";
const client: TestClient = new TestClient(host, undefined, password);
const newPassword: string = "myNewPasswordi";
let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
  this.user = await client.createUser();
  await forgotPasswordLockAccount(this.user.id, redis);
  const url = await createForgotPasswordLink("", this.user.id, redis);
  const parts = url.split("/");
  this.key = parts[parts.length - 1];
});

afterAll(() => conn.close());

describe("forgot password", () => {
  test("Password is to short", async () => {
    expect(await client.forgotPasswordUpdate("a", this.key)).toEqual({
      data: {
        forgotPasswordUpdate: [
          { path: "newPassword", message: passwordNotLongEnough },
        ],
      },
    });
  });

  test("Can change users password", async () => {
    expect(await client.login(this.user.email, password)).toEqual({
      data: {
        login: [{ path: "email", message: accountLocked }],
      },
    });

    const response = await client.forgotPasswordUpdate(newPassword, this.key);
    expect(response.data).toEqual({
      forgotPasswordUpdate: null,
    });

    expect(await client.login(this.user.email, newPassword)).toEqual({
      data: {
        login: null,
      },
    });

    expect(await client.me()).toEqual({
      data: {
        me: {
          id: this.user.id,
          email: this.user.email,
        },
      },
    });
  });

  test("Key expires after single use", async () => {
    expect(
      await client.forgotPasswordUpdate(this.user.email, this.key),
    ).toEqual({
      data: {
        forgotPasswordUpdate: [{ path: "key", message: expiredKeyError }],
      },
    });
  });

  test("Can update password", async () => {});
});
