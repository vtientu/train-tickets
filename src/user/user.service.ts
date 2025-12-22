import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { User } from 'src/user/entities/user.entity';
import { DbService } from 'src/db/db.service';
import { LoginUserDto } from 'src/user/dto/login-user.dto';

@Injectable()
export class UserService {
  @Inject(DbService)
  dbService: DbService;

  async register(registerUserDto: RegisterUserDto) {
    const users: User[] = await this.dbService.read();

    const newUser = new User();
    newUser.username = registerUserDto.username;
    newUser.password = registerUserDto.password;

    const userFind = users.find((user) => user.username === newUser.username);
    if (userFind) {
      throw new BadRequestException(`Username ${userFind.username} already`);
    }

    users.push(newUser);

    await this.dbService.write(users);

    return users;
  }

  async login(loginUserDto: LoginUserDto) {
    const users: User[] = await this.dbService.read();

    const userFind = users.find(
      (user) => user.username === loginUserDto.username,
    );

    if (!userFind) {
      throw new BadRequestException('Login failed!');
    }

    if (userFind.password !== loginUserDto.password) {
      throw new BadRequestException('Login failed!');
    }

    return userFind;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
