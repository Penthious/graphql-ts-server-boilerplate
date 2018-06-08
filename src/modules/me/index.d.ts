import { User } from "../../entity/User";

declare namespace ME {
  interface meResponse {
    data: {
      data: {
        me: User;
      };
    };
  }
}
