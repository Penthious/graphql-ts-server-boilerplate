import { Connection } from "typeorm";
import { createTypeormConn } from "../../utils/createTypeormConn";
import TestClient from "../../testSetup/testCLient";

const host = (process.env.TEST_HOST as string) + "/graphql";
const client = new TestClient(host);
const email: string = "tom@bob.com";
const password: string = "aoeuaoeuaoeu";
let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
  await client.createUser();
});

afterAll(() => conn.close());

describe("logout", () => {
  test("Can get current user", async () => {
    await client.login(email, password);

    const response = await client.me();
    expect(response.data.me).toBeTruthy();

    await client.logout();

    const response2 = await client.me();
    expect(response2.data.me).toBeNull();
  });
});
