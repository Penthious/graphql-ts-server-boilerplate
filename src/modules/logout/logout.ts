import { ResolverMap } from "../../types/graphql-utils";
import { removeSingleSession, removeAllUserSessions } from "../../utils/removeUserSession";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy",
  },
  Mutation: {
    logout: async (
      _,
      { multi }: GQL.ILogoutOnMutationArguments,
      { session, redis, request },
    ) => {
      const { userId } = session;
      if (userId && multi) {
        await removeAllUserSessions(userId, redis)
      } else if (userId && !multi) {
        await removeSingleSession(request.sessionID!);
      }
      return null;
    },
  },
};
