import { Redis } from "ioredis";
import { USER_SESSION_ID_PREFIX, REDIS_SESSION_PREFIX } from "./constants";
import { redis } from "../redis";

export const removeAllUserSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${USER_SESSION_ID_PREFIX}${userId}`,
    0,
    -1,
  );

  sessionIds.forEach(
    async (id: string) => await redis.del(`${REDIS_SESSION_PREFIX}${id}`),
  );
};

export const removeSingleSession = async (sessionId: string) =>
  await redis.del(`${REDIS_SESSION_PREFIX}${sessionId}`);
