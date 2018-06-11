import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { compare } from "bcryptjs";
import {
  invalidLogin,
  confirmEmailError,
  accountLocked,
} from "./errorMessages";
import { USER_SESSION_ID_PREFIX } from "../../../utils/constants";

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, request },
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user || !(await compare(password, user.password))) {
        return [
          {
            path: "email/password",
            message: invalidLogin,
          },
        ];
      }
      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: confirmEmailError,
          },
        ];
      }

      if (user.accountLocked) {
        return [
          {
            path: "email",
            message: accountLocked,
          },
        ];
      }

      session.userId = user.id;
      if (request.sessionID) {
        await redis.lpush(
          `${USER_SESSION_ID_PREFIX}${user.id}`,
          request.sessionID,
        );
      }

      return null;
    },
  },
};
