import { User } from "../entity/User";
import EntityNotFoundError from "../exceptions/EntityNotFoundError";
import Base from "./BaseRepository";
interface UserInterface extends User {
  [key: string]: any;
}
interface Params {
  email?: string;
  password?: string;
  confirmed?: boolean;
  accountLocked?: boolean;
  [key: string]: string | undefined | boolean;
}
export default class UserRepository extends Base {
  public async update(id: string, params: Params) {
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

  public async findWhere(params: Params) {
    const keys = Object.keys(params);
    const query = this.getUserRepository().createQueryBuilder("user");
    keys.map((key: any, index: number) => {
      const value = params[key];
      if (value) {
        if (index === 0) {
          query.where(`user.${key} = :value`, { value });
        } else {
          query.orWhere(`user.${key} = :value`, { value });
        }
      }
    });
    const result = await query.getOne();

    return result;
  }
}
