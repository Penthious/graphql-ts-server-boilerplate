import { v4 } from "uuid";
import { Redis } from "ioredis";

export const createConfirmEmailLink = async (
  url: string,
  userId: string,
  redis: Redis,
): Promise<string> => {
  const id = v4();
  console.log(url, "WE ARE URL");
  console.log(`${url}/confirm/${id}`);

  await storeLinkToRedis(id, userId, redis);
  return `${url}/confirm/${id}`;
};

export const storeLinkToRedis = (id: string, userId: string, redis: Redis) => {
  const twentyFourHours = 60 * 60 * 24;

  return redis.set(id, userId, "ex", twentyFourHours);
};
