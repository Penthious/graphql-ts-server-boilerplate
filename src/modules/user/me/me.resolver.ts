import middleware from "./middleware";
import { ResolverMap, Context } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { createMiddleware } from "../../../utils/createMiddleware";

export default class Me {
  public resolvers: ResolverMap = {
    Query: {
      me: createMiddleware(
        middleware,
        async (_, __, context) => await this._me(_, __, context),
      ),
    },
  };

  private async _me(_: any, __: any, { session }: Context) {
    return await User.findOne({ where: { id: session.userId } });
  }
}
