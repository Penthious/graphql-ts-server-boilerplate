import { Connection } from "typeorm";
import { createTypeormConn } from "../../utils/createTypeormConn";
import TestClient from "../../testSetup/testCLient";

const host = (process.env.TEST_HOST as string) + "/graphql";
const email: string = "tom@bob.com";
const password: string = "aoeuaoeuaoeu";
let conn: Connection;
const client: TestClient = new TestClient(host);

beforeAll(async () => {
  conn = await createTypeormConn();
  this.user = await client.createUser();
});

afterAll(() => conn.close());

describe("me", () => {
  test("Can not get user if not logged in", async () => {
    const response = await client.me();

    expect(response.data.me).toBeNull();
    expect(response.errors![0]).toHaveProperty("message");
  });

  test("Can get current user", async () => {
    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: this.user.id,
        email: this.user.email,
      },
    });
  });
});
