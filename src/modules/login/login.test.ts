import { createTypeormConn } from "../../utils/createTypeormConn";
import { request } from "graphql-request";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../entity/User";
import { Connection } from "typeorm";

const host = (process.env.TEST_HOST as string) + "/graphql";
const email: string = "tom@bob.com";
const password: string = "aoeuaoeuaoeu";
let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();

  await User.create({
    email,
    password,
    confirmed: false,
  }).save();
});

afterAll(() => conn.close());

describe("login", () => {
  const mutation = (email: string, password: string) => `
  mutation {
    login(email: "${email}", password: "${password}"){
      path
      message
    }
  }
  `;

  test("fails if no user is found", async () => {
    const response = await request<LOGIN.loginError>(
      host,
      mutation("no_user@false.com", password),
    );

    expect(response.login).toEqual([
      {
        path: "email/password",
        message: invalidLogin,
      },
    ]);
  });

  test("fails if user is found but password is wrong", async () => {
    const response = await request<LOGIN.loginError>(
      host,
      mutation(email, "FAIL_PASSWORD"),
    );

    expect(response.login).toEqual([
      {
        path: "email/password",
        message: invalidLogin,
      },
    ]);
  });

  test("fails if user logs in correctly but confirmed is false", async () => {
    const response = await request<LOGIN.loginError>(
      host,
      mutation(email, password),
    );

    expect(response.login).toEqual([
      {
        path: "email",
        message: confirmEmailError,
      },
    ]);
  });

  test("User can login", async () => {
    await User.update({ email }, { confirmed: true });

    const response = await request<LOGIN.login>(
      host,
      mutation(email, password),
    );

    expect(response.login).toEqual(null);
  });
});
