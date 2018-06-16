import middleware from "./middleware";
import { ResolverMap, Context } from "../../../types/graphql-utils";
import { createMiddleware } from "../../../utils/createMiddleware";
import { Inject } from "typescript-ioc";
import UserService from "../../../services/UserService";

export default class Me {
  public resolvers: ResolverMap = {
    Query: {
      me: createMiddleware(
        middleware,
        (_, __, context) => this._me(_, __, context),
      ),
    },
  };

  constructor(@Inject private userService: UserService){}

  private _me(_: any, __: any, { session }: Context) {
    return this.userService.findOne({id: session.userId});
  }
}
