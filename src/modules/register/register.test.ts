import { User } from "../../entity/User";
import { request } from "graphql-request";
import { startServer } from "../../startServer";
import { AddressInfo } from "net";

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo; // windows workaround to use AddressInfo as .address() is using windows pipe which returns a string

  getHost = () => `http://127.0.0.1:${port}`;
});

const email: string = "tom@bob.com";
const password: string = "jalksdf";

const mutation = `
mutation {
  register(email: "${email}", password: "${password}")
}
`;

test("Register user", async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});
