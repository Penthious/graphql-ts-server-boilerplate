import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";

import { resolvers } from "./resolvers";
import { createConnection } from "typeorm";

const server = new GraphQLServer({ typeDefs: "src/schema.graphql", resolvers });
createConnection().then(connection => {
  console.log(connection);

  server.start(() => console.log("server is running on localhost:4000"));
});
