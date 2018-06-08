import { createTypeormConn } from "../../utils/createTypeormConn";
import { request } from "graphql-request";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../entity/User";

const host = (process.env.TEST_HOST as string) + "/graphql";

beforeAll(async () => {
  await createTypeormConn();
});
describe("login", () => {
  const email: string = "tom@bob.com";
  const password: string = "aoeuaoeuaoeu";

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
      mutation(email, password),
    );

    expect(response.login).toEqual([
      {
        path: "email/password",
        message: invalidLogin,
      },
    ]);
  });

  test("fails if user is found but password is wrong", async () => {
    await User.create({ email, password }).save();

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
    const user = await User.create({
      email,
      password,
      confirmed: false,
    }).save();

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
    const validEmail = "valid@valid.com";
    const validPassword = "valid123";
    await User.create({
      email: validEmail,
      password: validPassword,
      confirmed: true,
    }).save();

    const response = await request<LOGIN.login>(
      host,
      mutation(validEmail, validPassword),
    );

    expect(response.login).toEqual(null);
  });
});
