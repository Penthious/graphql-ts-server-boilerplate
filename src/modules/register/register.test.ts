import { User } from "../../entity/User";
import { request } from "graphql-request";
import { startServer } from "../../startServer";
import { AddressInfo } from "net";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo; // windows workaround to use AddressInfo as .address() is using windows pipe which returns a string

  getHost = () => `http://127.0.0.1:${port}/graphql`;
});

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

describe("Register", () => {
  test("Register user", async () => {
    const response = await request<register>(getHost(), mutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  test("Register a user with the same email", async () => {
    const response = await request<registerError>(getHost(), mutation(email, password));

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  test("Catch non emails", async () =>{
    const response = await request<registerError>(getHost(), mutation("bad", password));

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: invalidEmail,
    })
  });

  test("Catch short emails", async () =>{
    const response = await request<registerError>(getHost(), mutation("b", password));

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: emailNotLongEnough,
    })
  });

  test("Catch short passwords", async () =>{
    const response = await request<registerError>(getHost(), mutation(email, '1'));

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "password",
      message: passwordNotLongEnough,
    })
  });
});