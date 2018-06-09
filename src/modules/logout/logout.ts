import { ResolverMap } from "../../types/graphql-utils";
import {
  USER_SESSION_ID_PREFIX,
  REDIS_SESSION_PREFIX,
} from "../../utils/constants";

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
        const sessionIds = await redis.lrange(
          `${USER_SESSION_ID_PREFIX}${userId}`,
          0,
          -1,
        );

        sessionIds.forEach(
          async (id: string) => await redis.del(`${REDIS_SESSION_PREFIX}${id}`),
        );
      } else if (userId && !multi) {
        await redis.del(`${REDIS_SESSION_PREFIX}${request.sessionID}`);
      }
      return null;
    },
  },
};
