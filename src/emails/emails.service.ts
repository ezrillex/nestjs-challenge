import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

export enum EMAIL_TEMPLATE {
  LOGIN_SUCCESSFUL,
  LOGIN_FAIL,
  FORGOT_PASSWORD,
  WELCOME,
}

@Injectable()
export class EmailsService {
  //   await this.emailsService.sendEmail(EMAIL_TEMPLATE.FORGOT_PASSWORD, {
  //   reset_token: 'asd;lfjaslk;dfjasl;dkjfal;skdjfakl;sdjfa;lsjfd',
  // });

  constructor(configService: ConfigService) {
    sgMail.setApiKey(configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendEmail(
    template: EMAIL_TEMPLATE,
    data: { [key: string]: string } = {},
  ) {
    const resolvedTemplate = this.getTemplateWithData(template, data);
    const msg: sgMail.MailDataRequired = {
      to: 'ezrillex@gmail.com', // Change to your recipient
      from: 'ezraabarca@ravn.co', // Change to your verified sender
      subject: 'Sending with SendGrid is Fun',
      ...resolvedTemplate,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.log(error.response.body.errors);
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
        return {
          templateId: 'd-fe46861d809e48b598ed28a463001d42',
          dynamicTemplateData: {
            user_first_name: data.user_first_name,
          },
        };
      default:
        throw new InternalServerErrorException('Email template not found!');
    }
  }
}
