import * as Passport from "passport";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { GraphQLServer } from "graphql-yoga";
import { User } from "../entity/User";
import UserRepository from "../repositories/UserRepository";
import { v4 } from "uuid";

export const twitterPassport = (server: GraphQLServer) => {
  const userRepository = new UserRepository();
  Passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
        callbackURL: "http://localhost:4000/auth/twitter/callback",
        includeEmail: true,
      },
      async (_, __, profile, cb) => {
        const { id, emails } = profile;
        const email: string | undefined = emails ? emails[0].value : undefined;

        let user = await userRepository.findWhere({
          twitterId: id,
          email,
        });

        if (!user) {
          const password = v4();
          user = await User.create({
            twitterId: id,
            password,
            email,
          }).save();

          //@todo: Send email to user with new account and account reset link
        } else if (!user.twitterId) {
          await userRepository.update(user.id, { twitterId: id });
        }

        return cb(null, { id: user.id });
      },
    ),
  );

  server.express.get("/auth/twitter", Passport.authenticate("twitter"));

  server.express.get(
    "/auth/twitter/callback",
    Passport.authenticate("twitter", { session: false }),
    (req: any, res: any) => {
      req.session.userId = req.user.id;
      //todo: redirect to frontend
      res.redirect("/");
    },
  );
  return Passport;
};
