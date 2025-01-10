import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Categories } from './categories.model';
import { Products } from '../products/products.model';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async ResolveProductsOnCategories(id: string): Promise<Products[]> {
    const { Products } = await this.prisma.categories.findUnique({
      where: {
        id,
      },
      select: {
        Products: true,
      },
    });
    return Products;
  }

  async CreateCategory(data: string): Promise<Categories> {
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

  async GetCategories(): Promise<Categories[]> {
    return this.prisma.categories.findMany({});
  }

  async DeleteCategory(id: string): Promise<string> {
    const record = await this.prisma.categories.count({
      where: { id: id },
    });

    if (record === 0) {
      throw new NotFoundException('Record not found.');
    }

    await this.prisma.categories.delete({
      where: {
        id: id,
      },
    });
    return 'Record Deleted';
  }

  async ResolveCategories(id: string): Promise<Categories[]> {
    const { categories } = await this.prisma.products.findUnique({
      where: {
        id: id,
      },
      select: {
        categories: true,
      },
    });
    return categories;
  }
}
