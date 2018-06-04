import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";

import { resolvers } from "./resolvers";
import { createConnection } from "typeorm";

export const startServer = async () => {
  const server = new GraphQLServer({
    typeDefs: "src/schema.graphql",
    resolvers,
  });
  await createConnection();

  await server.start();
  console.log("server is running on localhost:4000");
};

startServer();
