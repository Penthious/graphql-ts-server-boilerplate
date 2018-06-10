import { User } from "../entity/User";
import EntityNotFoundError from "../exceptions/EntityNotFoundError";
interface UserInterface extends User {
  [key: string]: any;
}
export default class UserRepository {
  public async update(
    id: string,
    params: {
      email?: string;
      password?: string;
      confirmed?: boolean;
      accountLocked?: boolean;
      [key: string]: string | undefined | boolean;
    },
  ) {
    const user = (await User.findOne({ where: { id } })) as UserInterface;
    if (user) {
      for (const key in params) {
        user[key] = params[key];
      }

      return await User.save(user);
    }
    throw new EntityNotFoundError(
      `No User instance was found with id of ${id}`,
    );
  }
}
