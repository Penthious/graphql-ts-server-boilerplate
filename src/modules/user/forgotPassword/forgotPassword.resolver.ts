import * as yup from "yup";

import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { expiredKeyError } from "./errorMessages";
import { FORGOT_PASSWORD_PREFIX } from "../../../utils/constants";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { formatYupError } from "../../../utils/formatYupError";
import {
  passwordValidation,
  newPasswordKeyValidation,
} from "../../../utils/yupSchemas";
import { ResolverMap, Context } from "../../../types/graphql-utils";
import UserService from "../../../services/UserService";
import { Singleton, Inject } from "typescript-ioc";

const schema = yup.object().shape({
  newPassword: passwordValidation,
  key: newPasswordKeyValidation,
});

@Singleton
export default class ForgotPassword {
  public resolvers: ResolverMap = {
    Mutation: {
      sendForgotPasswordEmail: (_, args, context) =>
        this._sendForgotPasswordEmail(_, args, context),
      forgotPasswordUpdate: (_, args, context) =>
        this._forgotPasswordUpdate(_, args, context),
    },
  };
  // private userService: UserService;

  constructor(@Inject private userService: UserService) {
    // this.userService = Container.get(UserService);
  }

  private async _sendForgotPasswordEmail(
    _: any,
    { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
    { redis }: Context,
  ) {
    const user = await this.userService.findOne({ email });
    // const user = await User.findOne({ where: { email } });
    if (user) {
      // @todo: add frontend url
      await forgotPasswordLockAccount(user.id, redis);
      /* const url = */ await createForgotPasswordLink("", user.id, redis);
      // await sendForgotPasswordEmail(email, url) // no function yet
      // @todo: send email with url
      return true;
    }
    return false;
  }

  private async _forgotPasswordUpdate(
    _: any,
    { newPassword, key }: GQL.IForgotPasswordUpdateOnMutationArguments,
    { redis }: Context,
  ) {
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

    await this.userService.update(userId, {
      password: newPassword,
      accountLocked: false,
    });

    return null;
  }
}
