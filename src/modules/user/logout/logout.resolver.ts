import { ResolverMap, Context } from "../../../types/graphql-utils";
import {
  removeSingleSession,
  removeAllUserSessions,
} from "../../../utils/removeUserSession";
export default class Logout {
  public resolvers: ResolverMap = {
    Mutation: {
      logout: async (_, args, context) => await this._logout(_, args, context),
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
