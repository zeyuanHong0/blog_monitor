import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { ConfigEnum } from '@/enum/config.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto, canSignupCode?: string) {
    if (canSignupCode !== this.configService.get(ConfigEnum.CAN_SIGNUP_CODE)) {
      throw new Error("can't signup");
    }
    const { username, password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });
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
