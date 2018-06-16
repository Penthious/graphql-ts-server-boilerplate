import * as assert from "assert";
import * as process from "process";
import { Singleton } from "typescript-ioc";
import { config } from "dotenv";

const pjson = require("../package.json");
const dotenv_path = `${__dirname}/../.env-${process.env.NODE_ENV}`;
config({ path: `${dotenv_path}` });

@Singleton
export default class GraphqlServerConfig {
  private app_version: string;
  private cors_origin: string;
  private database_host: string;
  private database_name: string;
  private database_password: string;
  private database_port: number;
  private database_username: string;
  private env: string;
  private express_app_port: number;
  private frontend_host: string;
  private service_name: string;
  private session_secret: string;
  private sparkpost_api_key: string;
  private twitter_consumer_key: string;
  private twitter_consumer_secret: string;

  constructor() {
    this.app_version = pjson.version;

    // MUST check NODE_ENV first
    assert(
      process.env.NODE_ENV as string,
      `No environmental variable with key "NODE_ENV" is set."`,
    );
    this.env = process.env.NODE_ENV as string;

    assert(
      process.env.CORS_ORIGIN,
      `No environmental variable with key "CORS_ORIGIN" is set."`,
    );
    this.cors_origin = process.env.CORS_ORIGIN as string;

    assert(
      process.env.DATABASE_HOST,
      `No environmental variable with key "DATABASE_HOST" is set."`,
    );
    this.database_host = process.env.DATABASE_HOST as string;

    assert(
      process.env.DATABASE_NAME,
      `No environmental variable with key "DATABASE_NAME" is set."`,
    );
    this.database_name = process.env.DATABASE_NAME as string;

    assert(
      process.env.DATABASE_PASSWORD,
      `No environmental variable with key "DATABASE_PASSWORD" is set."`,
    );
    this.database_password = process.env.DATABASE_PASSWORD as string;

    assert(
      process.env.DATABASE_PORT,
      `No environmental variable with key "DATABASE_PORT" is set."`,
    );
    this.database_port = parseInt(process.env.DATABASE_PORT as string);

    assert(
      process.env.DATABASE_USERNAME,
      `No environmental variable with key "DATABASE_USERNAME" is set."`,
    );
    this.database_username = process.env.DATABASE_USERNAME as string;

    // assert(
    //   process.env.LOG_LEVEL,
    //   `No environmental variable with key "LOG_LEVEL" is set."`,
    // );
    // this.log_level = process.env.LOG_LEVEL as string;

    assert(
      process.env.EXPRESS_APP_PORT,
      `No environmental variable with key "EXPRESS_APP_PORT" is set."`,
    );
    this.express_app_port = parseInt(process.env.EXPRESS_APP_PORT as string);

    assert(
      process.env.FRONTEND_HOST,
      `No environmental variable with key "FRONTEND_HOST" is set."`,
    );
    this.frontend_host = process.env.FRONTEND_HOST as string;

    assert(
      process.env.SERVICE_NAME,
      `No environmental variable with key "SERVICE_NAME" is set."`,
    );
    this.service_name = process.env.SERVICE_NAME as string;

    assert(
      process.env.SESSION_SECRET,
      `No environmental variable with key "SESSION_SECRET" is set."`,
    );
    this.session_secret = process.env.SESSION_SECRET as string;

    assert(
      process.env.SPARKPOST_API_KEY,
      `No environmental variable with key "SPARKPOST_API_KEY" is set."`,
    );
    this.sparkpost_api_key = process.env.SPARKPOST_API_KEY as string;

    assert(
      process.env.TWITTER_CONSUMER_KEY,
      `No environmental variable with key "TWITTER_CONSUMER_KEY" is set."`,
    );
    this.twitter_consumer_key = process.env.TWITTER_CONSUMER_KEY as string;

    assert(
      process.env.TWITTER_CONSUMER_SECRET,
      `No environmental variable with key "TWITTER_CONSUMER_SECRET" is set."`,
    );
    this.twitter_consumer_secret = process.env
      .TWITTER_CONSUMER_SECRET as string;

    // this.logger.logLevel = this.$log_level;

    // this.logger.log("INFO", "CONFIG", {
    //   message: "flightboard-configuration",
    //   config: {
    //     app_version: this.app_version,
    //     cors_origin: this.cors_origin,
    //     database_host: this.database_host,
    //     database_name: this.database_name,
    //     database_password: this.database_password,
    //     database_port: this.database_port,
    //     database_username: this.database_username,
    //     env: this.env,
    //     //jwt_public_key: this.jwt_public_key,
    //     koa_app_port: this.koa_app_port,
    //     log_level: this.log_level,
    //     service_name: this.service_name,
    //     teem_frontend_host: this.teem_frontend_host,
    //     teem_host: this.teem_host,
    //     telegraf_debug: this.telegraf_debug,
    //     telegraf_host: this.telegraf_host,
    //     telegraf_port: this.telegraf_port,
    //   },
    // });
  }

  public get $app_version(): string {
    return this.app_version;
  }

  public get $cors_origin(): string {
    return this.cors_origin;
  }

  public get $database_host(): string {
    return this.database_host;
  }

  public get $database_name(): string {
    return this.database_name;
  }

  public get $database_password(): string {
    return this.database_password;
  }

  public get $database_port(): number {
    return this.database_port;
  }

  public get $database_username(): string {
    return this.database_username;
  }

  public get $env(): string {
    return this.env;
  }

  public get $express_app_port(): number {
    return this.express_app_port;
  }

  public get $frontend_host(): string {
    return this.frontend_host;
  }

  public get $service_name(): string {
    return this.service_name;
  }

  public get $session_secret(): string {
    return this.session_secret;
  }

  public get $sparkpost_api_key(): string {
    return this.sparkpost_api_key;
  }

  public get $twitter_consumer_key(): string {
    return this.twitter_consumer_key;
  }

  public get $twitter_consumer_secret(): string {
    return this.twitter_consumer_secret;
  }
}
