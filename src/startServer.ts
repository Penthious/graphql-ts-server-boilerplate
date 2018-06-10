import "dotenv/config";
import "reflect-metadata";
import * as connectRedis from "connect-redis";
import * as session from "express-session";
import * as RateLimit from "express-rate-limit";
import * as RateLimitRedis from "rate-limit-redis";
import { GraphQLServer } from "graphql-yoga";

import { confirmEmail } from "./routes/confirmEmail";
import { createTypeormConn } from "./utils/createTypeormConn";
import { genSchema } from "./utils/genSchema";
import { redis } from "./redis";
import { REDIS_SESSION_PREFIX } from "./utils/constants";

const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      request,
      redis,
      session: request.session,
      url: `${request.protocol}://${request.get("host")}`,
    }),
  });

  server.express.use(
    new RateLimit({
      store: new RateLimitRedis({
        client: redis,
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      delayMs: 0,
    }),
  );

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: REDIS_SESSION_PREFIX,
      }),
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
