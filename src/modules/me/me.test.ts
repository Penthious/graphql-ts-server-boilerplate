import axios from "axios";
import { Connection } from "typeorm";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { User } from "../../entity/User";
import { ME } from ".";

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
  const loginMutation = (email: string, password: string) => `
  mutation {
    login(email: "${email}", password: "${password}"){
      path
      message
    }
  }
  `;
  const meQuery = `
  {
    me {
        id
        email
    }
  }
  `;
  test("Can not get user if not logged in", async () => {});

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
