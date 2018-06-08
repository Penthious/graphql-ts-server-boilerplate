import * as session from "express-session";
import * as connectRedis from "connect-redis";
import { GraphQLServer } from "graphql-yoga";

import { genSchema } from "./utils/genSchema";
import { redis } from "./redis";
import { createTypeormConn } from "./utils/createTypeormConn";
import { confirmEmail } from "./routes/confirmEmail";

const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      session: request.session,
      url: `${request.protocol}://${request.get("host")}`,
    }),
  });

  server.express.use(
    session({
      store: new RedisStore({}),
      name: "qid",
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === "test"
        ? "*"
        : (process.env.FRONTEND_HOST as string),
  };

  server.express.get("/confirm/:id", confirmEmail);

  await createTypeormConn();

  const options = {
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
    endpoint: "/graphql",
    subscriptions: "/subscriptions",
    playground: "/playground",
  };

  const app = await server.start(options);
  console.log("Server is running on localhost:4000");

  return app;
};
