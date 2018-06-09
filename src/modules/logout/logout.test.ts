import { Connection } from "typeorm";
import { createTypeormConn } from "../../utils/createTypeormConn";
import TestClient from "../../testSetup/testCLient";

const host = (process.env.TEST_HOST as string) + "/graphql";
const client = new TestClient(host);
const client2 = new TestClient(host);
const email: string = "tom@bob.com";
const password: string = "aoeuaoeuaoeu";
let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
  await client.createUser();
});

afterAll(() => conn.close());

describe("multiple sessions", () => {
  test("Logout across all open sessions", async () => {
    await client.login(email, password);
    await client2.login(email, password);

    expect(await client.me()).toEqual(await client2.me());

    await client.logout(true /*multi*/);
    expect(await client.me()).toEqual(await client2.me());
  });
});

describe("single session", () => {
  test("Can logout current user", async () => {
    await client.login(email, password);
    await client2.login(email, password);

    const response = await client.me();
    expect(response.data.me).toBeTruthy();

    await client.logout(false /*multi*/);

    const response2 = await client.me();
    expect(response2.data.me).toBeNull();

    const response3 = await client2.me();
    expect(response3.data.me).toBeTruthy();
  });
});
