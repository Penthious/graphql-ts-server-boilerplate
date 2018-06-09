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
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;
      if (userId) {
        const sessionIds = await redis.lrange(
          `${USER_SESSION_ID_PREFIX}${userId}`,
          0,
          -1,
        );

        sessionIds.forEach(
          async (id: string) => await redis.del(`${REDIS_SESSION_PREFIX}${id}`),
        );
      }
      return null;
    },
  },
};
