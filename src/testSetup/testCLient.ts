import * as rp from "request-promise";
import * as request from "request";
import { loginMutation, logoutMutation, registerMutation } from "./mutations";
import { meQuery } from "./queries";
import { ME } from "../modules/me";
import { User } from "../entity/User";
import { LOGOUT } from "../modules/logout";

export default class TestClient {
  private options: {
    jar: request.CookieJar;
    json: boolean;
    withCredentials: boolean;
  };

  private url: string;

  private user: User;
  private email: string = "tom@bob.com";
  private password: string = "aoeuaoeuaoeu";

  constructor(url: string, email?: string, password?: string) {
    this.url = url;
    email ? (this.email = email) : null;
    password ? (this.password = password) : null;

    this.options = {
      jar: rp.jar(),
      json: true,
      withCredentials: true,
    };
  }

  async createUser(): Promise<User> {
    this.user = await User.create({
      email: this.email,
      password: this.password,
      confirmed: true,
    }).save();

    return this.user;
  }

  get $user() {
    return this.user;
  }

  async login(
    email: string,
    password: string,
  ): Promise<LOGIN.login | LOGIN.loginError> {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: loginMutation(email, password),
      },
    });
  }

  async logout(): Promise<LOGOUT.logout> {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: logoutMutation,
      },
    });
  }

  async me(): Promise<ME.meResponse> {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: meQuery,
      },
    });
  }
  async register(
    email: string,
    password: string,
  ): Promise<REGISTER.register | REGISTER.registerError> {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: registerMutation(email, password),
      },
    });
  }
}
