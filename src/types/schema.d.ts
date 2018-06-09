// tslint:disable
// graphql typescript definitions

declare namespace GQL {
interface IGraphQLResponseRoot {
data?: IQuery | IMutation;
errors?: Array<IGraphQLResponseError>;
}

interface IGraphQLResponseError {
/** Required for all errors */
message: string;
locations?: Array<IGraphQLResponseErrorLocation>;
/** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
[propName: string]: any;
}

interface IGraphQLResponseErrorLocation {
line: number;
column: number;
}

interface IQuery {
__typename: "Query";
bye2: string | null;
dummy: string | null;
me: IUser | null;
bye: string | null;
}

interface IUser {
__typename: "User";
id: string;
email: string;
}

interface IMutation {
__typename: "Mutation";
login: Array<IError>;
logout: boolean;
register: Array<IError>;
}

interface ILoginOnMutationArguments {
email: string;
password: string;
}

interface ILogoutOnMutationArguments {
multi: boolean;
}

interface IRegisterOnMutationArguments {
email: string;
password: string;
}

interface IError {
__typename: "Error";
path: string;
message: string;
}
}

// tslint:enable
