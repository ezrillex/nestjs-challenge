import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Categories } from './categories.model';
import { Products } from '../products/products.model';
import { roles } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(data: string): Promise<Categories> {
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

  async getProductsByCategory(id: string, role: roles): Promise<Products[]> {
    let hide = {};
    if (role === roles.manager) {
      hide = {
        where: {
          is_deleted: false,
        },
      };
    } else {
      hide = {
        where: {
          is_deleted: false,
          is_published: true,
        },
      };
    }

    const { Products } = await this.prisma.categories.findUnique({
      where: {
        id,
      },
      select: {
        Products: hide,
      },
    });
    return Products;
  }

  async getAllCategories(): Promise<Categories[]> {
    return this.prisma.categories.findMany({});
  }

  async getCategoriesByProduct(id: string): Promise<Categories[]> {
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

  async deleteCategoryById(id: string): Promise<string> {
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
}
