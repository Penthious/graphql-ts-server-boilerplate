import * as yup from "yup";

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { createConfirmEmailLink } from "../../../utils/createConfirmEmailLink";
import { duplicateEmail } from "./errorMessages";
import { emailValidation, passwordValidation } from "../../../utils/yupSchemas";
import { formatYupError } from "../../../utils/formatYupError";
import { sendEmail } from "../../../utils/sendEmail";
import { Redis } from "ioredis";

const schema = yup.object().shape({
  email: emailValidation,
  password: passwordValidation,
});

export default class Register {
  public resolvers: ResolverMap = {
    Mutation: {
      register: (_, args, { redis, url }) =>
        this.register(_, args, { redis, url }),
    },
  };

  private async register(
    _: any,
    args: GQL.IRegisterOnMutationArguments,
    { redis, url }: { redis: Redis; url: string },
  ) {
    try {
      await schema.validate(args, { abortEarly: false });
    } catch (err) {
      return formatYupError(err);
    }
    const { email, password } = args;
    const userExists = await User.findOne({
      where: { email },
      select: ["id"],
    });

    if (userExists) {
      return [
        {
          path: "email",
          message: duplicateEmail,
        },
      ];
    }

    const user = User.create({
      email,
      password,
    });

    await user.save();
    if (!process.env.TEST_HOST) {
      await sendEmail(email, await createConfirmEmailLink(url, user.id, redis));
    }
    return null;
  }
}
