import axios from "axios";
import { Connection } from "typeorm";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { User } from "../../entity/User";
import { loginMutation, logoutMutation } from "../../testSetup/mutations";
import { meQuery } from "../../testSetup/queries";

const host = (process.env.TEST_HOST as string) + "/graphql";
const email: string = "tom@bob.com";
const password: string = "aoeuaoeuaoeu";
let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();

  await User.create({
    email,
    password,
    confirmed: true,
  }).save();
});

afterAll(() => conn.close());

describe("logout", () => {
  test("Can get current user", async () => {
    await axios.post(
      host,
      {
        query: loginMutation(email, password),
      },
      { withCredentials: true },
    );

    const response = await meAxios();
    expect(response.data.data.me).toBeTruthy();

    await axios.post(
      host,
      { query: logoutMutation },
      { withCredentials: true },
    );
    expect(response.data.data.me).toBeTruthy();

    const response2 = await meAxios();
    expect(response2.data.data.me).toBeNull();
  });
});

const meAxios = () =>
  axios.post(host, { query: meQuery }, { withCredentials: true });
