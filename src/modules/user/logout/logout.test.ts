import TestClient from "../../../testSetup/testCLient";
import { Container } from "typescript-ioc";
import App from "../../../App";

const host = (process.env.TEST_HOST as string) + "/graphql";
const client = new TestClient(host);
const client2 = new TestClient(host);
const email: string = "tom@bob.com";
const password: string = "aoeuaoeuaoeu";
const app: App = Container.get(App);

beforeAll(async () => {
  await app.createConn();
  await client.createUser(email, password);
});

afterAll(async () => {
  await app.stop();
});

describe("multiple sessions", () => {
  // @todo: since we are using a singleton for App now
  // we can no longer call two apps as they point to the same appp
  // need to find a way to create two apps possibly through docker
  // and then do this check
  test.skip("Logout across all open sessions", async () => {
    await client.login(email, password);
    await client2.login(email, password);

    expect(await client.me()).toEqual(await client2.me());

    await client.logout(true /*multi*/);
    expect(await client.me()).toEqual(await client2.me());
  });
});

describe("single session", () => {
  test("Can logout current user", async () => {
    const data = await client.login(email, password);
    console.log(data.data.login);
    // await client2.login(email, password);

    const response = await client.me();
    expect(response.data.me).toBeTruthy();

    await client.logout(false /*multi*/);

    const response2 = await client.me();
    expect(response2.data.me).toBeNull();

    // const response3 = await client2.me();
    // expect(response3.data.me).toBeTruthy();
  });
});
