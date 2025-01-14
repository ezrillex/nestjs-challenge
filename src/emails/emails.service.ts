import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

export enum EMAIL_TEMPLATE {
  LOGIN_SUCCESSFUL,
  LOGIN_FAIL,
  FORGOT_PASSWORD,
  WELCOME,
  LOW_STOCK_REMINDER,
}

@Injectable()
export class EmailsService {
  constructor(private readonly configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendEmail(
    template: EMAIL_TEMPLATE,
    data: { [key: string]: string } = {},
  ): Promise<void> {
    const resolvedTemplate = this.getTemplateWithData(template, data);
    const msg: sgMail.MailDataRequired = {
      to: 'ezrillex@gmail.com', // todo HARDCODED TO PREVENT SPAMMING SOME RANDOM USER
      from: 'ezraabarca@ravn.co',
      subject: 'Sending with SendGrid is Fun',
      ...resolvedTemplate,
    };

    try {
      await sgMail.send(msg);
    } catch {
      throw new InternalServerErrorException(
        'An error occurred when sending email.',
      );
    }
  }

  async sendManyEmails(
    emails: { template: EMAIL_TEMPLATE; data: any }[],
  ): Promise<void> {
    const compiledEmails: sgMail.MailDataRequired[] = emails.map((email) => {
      const resolvedTemplate = this.getTemplateWithData(
        email.template,
        email.data,
      );
      return {
        to: 'ezrillex@gmail.com', // todo HARDCODED TO PREVENT SPAMMING SOME RANDOM USER
        from: 'ezraabarca@ravn.co',
        ...resolvedTemplate,
      };
    });

    try {
      await sgMail.send(compiledEmails, true);
    } catch {
      throw new InternalServerErrorException(
        'An error occurred when sending email.',
      );
    }
  }

  getTemplateWithData(
    template: EMAIL_TEMPLATE,
    data: { [key: string]: string } = {},
  ): {
    templateId: string;
    dynamicTemplateData: object;
  } {
    switch (template) {
      case EMAIL_TEMPLATE.LOGIN_SUCCESSFUL:
        return {
          templateId: 'd-1b95ac066cbc4a56ad38b21fd2439eb8',
          dynamicTemplateData: {
            login_date: new Date().toLocaleString(),
          },
        };
      case EMAIL_TEMPLATE.LOGIN_FAIL:
        return {
          templateId: 'd-4f4010b2654b498bb75df3a7782bd16e',
          dynamicTemplateData: {
            login_attempt_date: new Date().toLocaleString(),
          },
        };
      case EMAIL_TEMPLATE.FORGOT_PASSWORD:
        if (!data.reset_token) {
          throw new InternalServerErrorException(
            'Internal service call is missing critical data.',
          );
        }
        return {
          templateId: 'd-f9a9705af27743c49cd2583d8efe7225',
          dynamicTemplateData: {
            reset_token: data.reset_token,
          },
        };
      case EMAIL_TEMPLATE.WELCOME:
        if (!data.user_first_name) {
          throw new InternalServerErrorException(
            'Internal service call is missing critical data.',
          );
        }
        return {
          templateId: 'd-fe46861d809e48b598ed28a463001d42',
          dynamicTemplateData: {
            user_first_name: data.user_first_name,
          },
        };
      case EMAIL_TEMPLATE.LOW_STOCK_REMINDER:
        if (!(data.product_title && data.product_image)) {
          throw new InternalServerErrorException(
            'Internal service call is missing critical data.',
          );
        }
        return {
          templateId: 'd-50661982a5a4499699949b17e60fd5e5',
          dynamicTemplateData: {
            product_title: data.product_title,
            product_image: data.product_image,
          },
        };
      default:
        throw new InternalServerErrorException('Email template not found!');
    }
  }
}
