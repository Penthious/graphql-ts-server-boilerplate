import { GraphQLSchema } from "graphql";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import { join } from "path";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { readdirSync } from "fs";
import * as Redis from "ioredis";

import { createTypeormConn } from "./utils/createTypeormConn";
import { User } from "./entity/User";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders: string[] = readdirSync(join(__dirname, "./modules"));
  folders.forEach(folder => {
    console.log(folder);

    const { resolvers } = require(`./modules/${folder}/${folder}`);
    const typeDefs = importSchema(
      join(__dirname, `./modules/${folder}/${folder}.graphql`),
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const redis = new Redis();

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`,
    }),
  });

  server.express.get("/confirm/:id", async (req, res) => {
    const { id }: { id: string } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      await User.update({ id: userId }, { confirmed: true });
      await redis.del(id);
      res.send("ok");
    } else {
      res.send("invalid");
    }
  });
  await createTypeormConn();

  const options = {
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
    endpoint: "/graphql",
    subscriptions: "/subscriptions",
    playground: "/playground",
  };

  const app = await server.start(options);
  console.log("Server is running on localhost:4000");

  return app;
};
