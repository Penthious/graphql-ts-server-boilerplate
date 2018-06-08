import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { compare } from "bcryptjs";
import { invalidLogin, confirmEmailError } from "./errorMessages";

export const resolvers: ResolverMap = {
  Query: {
    bye2: () => "bye",
  },
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      const user = await User.findOne({ where: { email } });

      const users = await User.query("select * from users");
      console.log(users);

      console.log(user, email, password);

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

      return null;
    },
  },
};
