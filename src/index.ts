import GraphqlServer from "./App";
import { Container } from "typescript-ioc";

const app: GraphqlServer = Container.get(GraphqlServer);

app.start();
