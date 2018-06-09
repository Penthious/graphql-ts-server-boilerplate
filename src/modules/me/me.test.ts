import axios from "axios";
import { Connection } from "typeorm";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { User } from "../../entity/User";
import { ME } from ".";
import { loginMutation } from "../../testSetup/mutations";
import { meQuery } from "../../testSetup/queries";

const host = (process.env.TEST_HOST as string) + "/graphql";
const email: string = "tom@bob.com";
const password: string = "aoeuaoeuaoeu";
let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();

  this.user = await User.create({
    email,
    password,
    confirmed: true,
  }).save();
});

afterAll(() => conn.close());

describe("me", () => {
  test("Can not get user if not logged in", async () => {
    const response = await axios.post(host, { query: meQuery });

    expect(response.data.data.me).toBeNull();
    expect(response.data.errors[0]).toHaveProperty("message");
  });

  test("Can get current user", async () => {
    await axios.post(
      host,
      {
        query: loginMutation(email, password),
      },
      { withCredentials: true },
    );

    const response = await axios.post<ME.meResponse>(
      host,
      { query: meQuery },
      { withCredentials: true },
    );

    expect(response.data.data).toEqual({
      me: {
        id: this.user.id,
        email: this.user.email,
      },
    });
  });
});
