import * as yup from "yup";

import UserRepository from "../../../repositories/UserRepository";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { expiredKeyError } from "./errorMessages";
import { FORGOT_PASSWORD_PREFIX } from "../../../utils/constants";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { formatYupError } from "../../../utils/formatYupError";
import {
  passwordValidation,
  newPasswordKeyValidation,
} from "../../../utils/yupSchemas";
import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";

const schema = yup.object().shape({
  newPassword: passwordValidation,
  key: newPasswordKeyValidation,
});

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis },
    ) => {
      const user = await User.findOne({ where: { email } });
      if (user) {
        // @todo: add frontend url
        await forgotPasswordLockAccount(user.id, redis);
        /* const url = */ await createForgotPasswordLink("", user.id, redis);
        // await sendForgotPasswordEmail(email, url) // no function yet
        // @todo: send email with url
        return true;
      }
      return false;
    },
    forgotPasswordUpdate: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordUpdateOnMutationArguments,
      { redis },
    ) => {
      try {
        await schema.validate({ newPassword, key }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }
      const userId = await redis.get(`${FORGOT_PASSWORD_PREFIX}${key}`);

      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKeyError,
          },
        ];
      }

      await redis.del(`${FORGOT_PASSWORD_PREFIX}${key}`);

      await new UserRepository().update(userId, {
        password: newPassword,
        accountLocked: false,
      });

      return null;
    },
  },
};
