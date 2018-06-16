import "reflect-metadata";
import * as connectRedis from "connect-redis";
import * as RateLimit from "express-rate-limit";
import * as RateLimitRedis from "rate-limit-redis";
import * as Redis from "ioredis";
import * as session from "express-session";
import { Inject, Singleton } from "typescript-ioc";
import { Connection, createConnection } from "typeorm";
import { GraphQLServer } from "graphql-yoga";

import GraphqlServerConfig from "./Config";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";
import { REDIS_SESSION_PREFIX } from "./utils/constants";
import { twitterPassport } from "./routes/twitterOauth";

@Singleton
export default class App {
  //   private _name: string = "graphql_server.App";
  public connectionOptions = this.setupOrmConfigOptions();
  public redis: Redis.Redis;
  public server: GraphQLServer;
  private connection: Connection;

  private RedisStore = connectRedis(session);

  constructor(@Inject private graphqlServerConfig: GraphqlServerConfig) {
    this.redis = new Redis();
  }

  /**
   * Creates an instance of express wraped inside graphql-yoga
   * Listens on port 4000
   */
  public async start() {
    const server = this.createApp();
    const options = this.setupConnectionOptions();

    console.log(`Server is running on port: ${options.port}`);
    return (await server).start(options);
  }

  /**
   * Wrapper to Terminate the TypeORM Db Connection
   */
  public async stop() {
    return this.stopConnection();
  }

  public setupOrmConfigOptions() {
    return {
      name: "default",
      type: "postgres",
      host: this.graphqlServerConfig.$database_host,
      port: this.graphqlServerConfig.$database_port,
      username: this.graphqlServerConfig.$database_username,
      password: this.graphqlServerConfig.$database_password,
      database: this.graphqlServerConfig.$database_name,
      synchronize: true,
      logging: this.graphqlServerConfig.$env !== "test",
      dropSchema: this.graphqlServerConfig.$env === "test",
      entities: ["src/entity/**/*.ts"],
      migrations: ["src/migration/**/*.ts"],
      subscribers: ["src/subscriber/**/*.ts"],
      cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber",
      },
    };
  }

  public setupConnectionOptions(): {
    cors: { credentials: boolean; origin: string };
    port: number;
    endpoint: string;
    subscriptions: string;
    playground: string;
  } {
    const cors = {
      credentials: true,
      origin: this.graphqlServerConfig.$cors_origin,
    };

    return {
      cors,
      port: this.graphqlServerConfig.$express_app_port,
      endpoint: "/graphql",
      subscriptions: "/subscriptions",
      playground: "/playground",
    };
  }

  public async createConn(config: any = this.setupOrmConfigOptions()) {
    try {
      this.connection = await createConnection(config);
      return this.connection;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async createApp() {
    await this.createConn(this.connectionOptions);
    const server = new GraphQLServer({
      schema: genSchema(),
      context: ({ request }) => ({
        request,
        redis: this.redis,
        session: request.session,
        url: `${request.protocol}://${request.get("host")}`,
      }),
    });

    if (this.graphqlServerConfig.$env === "production") {
      server.express.use(
        new RateLimit({
          store: new RateLimitRedis({
            client: this.redis,
          }),
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100,
          delayMs: 0,
        }),
      );
    }

    server.express.use(
      session({
        store: new this.RedisStore({
          client: this.redis as any,
          prefix: REDIS_SESSION_PREFIX,
        }),
        name: "qid",
        secret: this.graphqlServerConfig.$session_secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: this.graphqlServerConfig.$env === "production",
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
      }),
    );

    server.express.get("/confirm/:id", confirmEmail);

    server.express.use(twitterPassport(server).initialize());

    this.server = server;

    return server;
  }

  /**
   * Terminate the TypeORM Db Connection
   */
  private async stopConnection() {
    await this.connection.close();
    await this.redis.quit();

    return this.connection;
  }
}
