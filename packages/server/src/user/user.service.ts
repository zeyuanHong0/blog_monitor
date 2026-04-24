import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;
    const user = this.userRepository.create({ username, password });
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async getProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'username', 'accountType'],
    });
    return {
      data: {
        userInfo: user,
      },
    };
  }

  async findOne(username: string) {
    return await this.userRepository.findOne({
      where: {
        username,
      },
      select: ['id', 'username', 'password'],
    });
  }

  async findOneById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'accountType'],
    });
  }
}