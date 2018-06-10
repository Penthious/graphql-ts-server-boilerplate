import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import * as yup from "yup";
import { formatYupError } from "../../utils/formatYupError";
import { duplicateEmail } from "./errorMessages";
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";
import { sendEmail } from "../../utils/sendEmail";
import { emailValidation, passwordValidation } from "../../utils/yupSchemas";

const schema = yup.object().shape({
  email: emailValidation,
  password: passwordValidation,
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye",
  },
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url },
    ) => {
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
        await sendEmail(
          email,
          await createConfirmEmailLink(url, user.id, redis),
        );
      }
      return null;
    },
  },
};
