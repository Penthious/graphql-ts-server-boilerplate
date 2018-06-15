// import { GraphQLSchema } from "graphql";
// import { importSchema } from "graphql-import";
// import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
// import { join } from "path";
// import { readdirSync } from "fs";

// export const genSchema = () => {
//   const schemas: GraphQLSchema[] = [];
//   const folders: string[] = readdirSync(join(__dirname, "../modules"));
//   folders.forEach(folder => {
//     console.log(folders);
//     console.log(schemas);

//     const { resolvers } = require(`../modules/${folder}/${folder}.resolver.ts`);

//     const typeDefs = importSchema(
//       join(__dirname, `../modules/${folder}/${folder}.graphql`),
//     );
//     schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
//   });

//   return mergeSchemas({ schemas });
// };

import { makeExecutableSchema } from "graphql-tools";
import { fileLoader, mergeResolvers, mergeTypes } from "merge-graphql-schemas";
import { join } from "path";
import * as Glob from "glob";

export const genSchema = () => {
  const pathToModules = join(__dirname, "../modules");
  const resolversClassArray = Glob.sync(`${pathToModules}/**/*.resolver.*`).map(
    resolver => require(resolver),
  );
  console.log("================");
  const resolversArray = resolversClassArray.map(
    item => new item.default().resolvers,
  );
  console.log("================");

  const typesArray = fileLoader(join(__dirname, "../"), {
    recursive: true,
    extensions: [".graphql"],
  });

  const typeDefs = mergeTypes(typesArray, {
    all: true,
  });

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: mergeResolvers(resolversArray),
  });

  return schema;
};
