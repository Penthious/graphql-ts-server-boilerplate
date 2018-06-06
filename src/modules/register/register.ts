import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { hash } from "bcryptjs";
import { outputError } from "../../utils/responseHandling";

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye",
  },
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments,
    ) => {
      const userExists = await User.findOne({
        where: { email },
        select: ["id"],
      });

      if (userExists) {
        return outputError({
          path: "email",
          message: "Already exists",
          status: 401,
        });
      }

      const hashedPassword = await hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword,
      });

      await user.save();
      return null;
    },
  },
};
