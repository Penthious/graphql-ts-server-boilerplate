import * as rp from "request-promise";
import * as request from "request";
import {
  loginMutation,
  logoutMutation,
  registerMutation,
  forgotPasswordMutation,
} from "./mutations";
import { meQuery } from "./queries";
import { User } from "../entity/User";
import { LOGOUT } from "../modules/user/logout";
import { ME } from "../modules/user/me";

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

  constructor(url: string) {
    this.url = url;

    this.options = {
      jar: rp.jar(),
      json: true,
      withCredentials: true,
    };
  }

  async createUser(
    email: string | null = null,
    password: string | null = null,
  ): Promise<User> {
    this.email = email || this.email;
    this.password = password || this.password;

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

  async forgotPasswordUpdate(
    newPassword: string,
    key: string,
  ): Promise<
    | FORGOTPASSWORD.forgotPasswordChange
    | FORGOTPASSWORD.forgotPasswordChangeError
  > {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: forgotPasswordMutation(newPassword, key),
      },
    });
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

  async logout(multi: boolean): Promise<LOGOUT.logout> {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: logoutMutation(multi),
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
