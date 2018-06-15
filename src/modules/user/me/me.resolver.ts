import middleware from "./middleware";
import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { createMiddleware } from "../../../utils/createMiddleware";

export default class Me {
  public resolvers: ResolverMap = {
    Query: {
      me: createMiddleware(middleware, (_, __, { session }) =>
        User.findOne({ where: { id: session.userId } }),
      ),
    },
  };
}
