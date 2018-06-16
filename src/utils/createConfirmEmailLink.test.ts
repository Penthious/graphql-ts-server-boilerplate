import * as Redis from "ioredis";
import fetch from "node-fetch";
import TestClient from "../testSetup/testCLient";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { User } from "../entity/User";
import App from "../App";
import { Container } from "typescript-ioc";

const host = process.env.TEST_HOST as string;
const client = new TestClient(host);
const app: App = Container.get(App);

beforeAll(async () => {
  await app.createConn();
  const user = await client.createUser();

  this.userId = user.id;
});

afterAll(async () => {
  await app.stop();
});

describe("Email link", () => {
  const redis = new Redis();

  test("Make sure it confirms user and clears key in redis", async () => {
    const url = await createConfirmEmailLink(host, this.userId, redis);
    const response = await fetch(url);
    const text = await response.text();

    expect(text).toEqual("ok");

    const user = (await User.findOne({ where: { id: this.userId } })) as User;
    expect(user.confirmed).toBeTruthy();

    const key = url.split("/").pop() as string;

    const value = await redis.get(key);
    expect(value).toBeNull();
  });

  test("Sends invalid back if bad id sent", async () => {
    const response = await fetch(`${host}/confirm/fake_id`);
    const text = await response.text();

    expect(text).toEqual("invalid");
  });
});
