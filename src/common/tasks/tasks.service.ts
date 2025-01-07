import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProductsService } from '../../products/products.service';
import { EMAIL_TEMPLATE, EmailsService } from '../../emails/emails.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly emailsService: EmailsService,
  ) {}

  @Cron('* * * * *')
  async randomCron() {
    console.log(
      `Current Time: ${new Date().toLocaleString()}, random number: ${Math.random()}`,
    );
  }

  // Since I don't have any stock logic for now it is at 6pm. For now It doesn't check if purchased.
  // When the stock of a product reaches 3, notify the last user that liked it and not purchased the product yet with an email.
  // Use a background job and make sure to include the product's image in the email.
  @Cron('0 18 * * *')
  async marketingLowStockProducts() {
    const subjects = await this.productsService.GetLowStockProducts();
    if (subjects.length === 0) {
      return;
    }
    const emails = subjects.reduce((previousValue, current) => {
      previousValue.push({
        template: EMAIL_TEMPLATE.LOW_STOCK_REMINDER,
        data: {
          product_title: current.title,
          product_image: current.images[0].url,
        },
      });
      return previousValue;
    }, []);

    await this.emailsService.sendManyEmails(emails);
  }
}
