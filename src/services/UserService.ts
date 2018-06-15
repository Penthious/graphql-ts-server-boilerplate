import { Inject, Singleton } from "typescript-ioc";
import UserRepository from "../repositories/UserRepository";
import { Params, CreateUserParams } from "../types/UserTypes";
import { User } from "../entity/User";

const LOG_MODULE_NAME = "graphql_server.UserService";

@Singleton
export default class UserService {
  private _name: string = LOG_MODULE_NAME;

  constructor(@Inject private userRepository: UserRepository) {}

  public async update(id: string, params: Params) {
    return await this.userRepository.update(id, params);
  }

  public async findWhere(params: Params) {
    return await this.userRepository.findWhere(params);
  }

  public async create(params: CreateUserParams) {
    return await this.userRepository.create(params);
  }

  public async save(user: User) {
    return await this.userRepository.save(user);
  }
}
