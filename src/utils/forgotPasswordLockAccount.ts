import { Redis } from "ioredis";

import { removeAllUserSessions } from "./removeUserSession";
import { User } from "../entity/User";

export const forgotPasswordLockAccount = async (
  userId: string,
  redis: Redis,
) => {
  await User.update({ id: userId }, { accountLocked: true });
  await removeAllUserSessions(userId, redis);
};
