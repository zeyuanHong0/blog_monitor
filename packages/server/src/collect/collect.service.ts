import { Injectable } from '@nestjs/common';

@Injectable()
export class CollectService {
  findAll() {
    return `This action returns all collect`;
  }

  findOne(id: number) {
    return `This action returns a #${id} collect`;
  }

  remove(id: number) {
    return `This action removes a #${id} collect`;
  }
}
