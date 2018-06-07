import { GraphQLSchema } from "graphql";
import { importSchema } from "graphql-import";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { join } from "path";
import { readdirSync } from "fs";

export const genSchema = () => {
  const schemas: GraphQLSchema[] = [];
  const folders: string[] = readdirSync(join(__dirname, "../modules"));
  folders.forEach(folder => {
    console.log(folder);

    const { resolvers } = require(`../modules/${folder}/${folder}`);
    const typeDefs = importSchema(
      join(__dirname, `../modules/${folder}/${folder}.graphql`),
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  return mergeSchemas({ schemas });
};
