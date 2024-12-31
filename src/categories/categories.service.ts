import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async CreateCategory(data: string) {
    // todo format when duplicate error.
    return this.prisma.categories.create({
      data: {
        name: data,
      },
    });
  }

  async DeleteCategory(id: string) {
    const record = await this.prisma.categories.findUnique({
      where: { id: id },
    });

    if (!record) {
      throw new NotFoundException('Record not found.');
    }

    const result = await this.prisma.categories.delete({
      where: {
        id: id,
      },
    });

    if (result) {
      return 'Record Deleted';
    } else {
      throw new InternalServerErrorException(
        'An error occurred when deleting the category.',
      );
    }
  }
}
