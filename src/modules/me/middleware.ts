import { Resolver, Context } from "../../types/graphql-utils";

export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: Context,
  info: any,
) => {
  const result = await resolver(parent, args, context, info);

  return result;
};
