import { GraphQLSchema } from "graphql";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import { join } from "path";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { readdirSync } from "fs";

import { createTypeormConn } from "./utils/createTypeormConn";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders: string[] = readdirSync(join(__dirname, "./modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      join(__dirname, `./modules/${folder}/schema.graphql`),
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) });
  await createTypeormConn();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log("Server is running on localhost:4000");

  return app;
};
