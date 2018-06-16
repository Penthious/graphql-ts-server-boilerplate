import { Container } from "typescript-ioc";
import { Redis } from "ioredis";

import GraphqlServer from "../App";
import { REDIS_SESSION_PREFIX, USER_SESSION_ID_PREFIX } from "./constants";

const App: GraphqlServer = Container.get(GraphqlServer);

export const removeAllUserSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${USER_SESSION_ID_PREFIX}${userId}`,
    0,
    -1,
  );

  sessionIds.forEach(async (id: string) =>
    redis.del(`${REDIS_SESSION_PREFIX}${id}`),
  );
};

export const removeSingleSession = async (sessionId: string) =>
  App.redis.del(`${REDIS_SESSION_PREFIX}${sessionId}`);
