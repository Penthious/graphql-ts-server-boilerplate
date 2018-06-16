import { Singleton } from "typescript-ioc";
import { User } from "../entity/User";

// const LOG_MODULE_NAME = "graphql-server.SessionService";

@Singleton
export default class SessionService {
  private static _instance: SessionService = new SessionService();

  private currentUser: User;

  private constructor() {
    if (SessionService._instance) {
      return SessionService._instance;
    }

    SessionService._instance = this;
  }

  public static get $instance(): SessionService {
    return this._instance;
  }

  public set $currentUser(user: User) {
    this.currentUser = user;
  }

  public get $currentUser() {
    return this.currentUser;
  }
}
