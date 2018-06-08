import "dotenv/config";
import { AddressInfo } from "net";
import { startServer } from "../startServer";

export const setup = async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo; // windows workaround to use AddressInfo as .address() is using windows pipe which returns a string https://github.com/DefinitelyTyped/DefinitelyTyped/issues/25865

  process.env.TEST_HOST = `http://127.0.0.1:${port}`;
};
