import { Context, ResolverMap } from "../../../types/graphql-utils";
import {
  removeAllUserSessions,
  removeSingleSession,
} from "../../../utils/removeUserSession";

export default class Logout {
  public resolvers: ResolverMap = {
    Mutation: {
      logout: (_, args, context) => this._logout(_, args, context),
    },
  };

  private async _logout(
    _: any,
    { multi }: GQL.ILogoutOnMutationArguments,
    { redis, request, session }: Context,
  ) {
    const { userId } = session;
    if (userId && multi) {
      await removeAllUserSessions(userId, redis);
    } else if (userId && !multi) {
      await removeSingleSession(request.sessionID!);
    }
    return null;
  }
}
