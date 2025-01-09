import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Categories } from './categories.model';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async CreateCategory(data: string) {
    const exists = await this.prisma.categories.count({
      where: { name: data },
    });
    if (exists > 0) {
      throw new NotAcceptableException('Category already exists');
    }

    return this.prisma.categories.create({
      data: {
        name: data,
      },
    });
  }

  async DeleteCategory(id: string) {
    const record = await this.prisma.categories.count({
      where: { id: id },
    });

    if (record === 0) {
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

  async ResolveCategories(ids: string[]): Promise<Categories[]> {
    return this.prisma.categories.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
