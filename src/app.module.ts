import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ImagesModule } from './images/images.module';
import Joi from 'joi';
import { GraphQLFormattedError } from 'graphql/error';
import { PaymentsModule } from './payments/payments.module';
import { CategoriesModule } from './categories/categories.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { LikesModule } from './likes/likes.module';
import { EmailsModule } from './emails/emails.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWTCONSTANT: Joi.string().required(),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        STRIPE_SHAREABLE_KEY: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SIGNING_SECRET: Joi.string().required(),
        AUTO_ROLE: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      definitions: {
        path: join(process.cwd(), 'src/graphql/graphql.ts'),
        outputAs: 'class',
        emitTypenameField: true,
      },
      formatError: (error): GraphQLFormattedError => {
        let prefix = '';
        if (
          error &&
          error.extensions &&
          error.extensions.originalError &&
          error.extensions.originalError['error']
        ) {
          prefix = error.extensions.originalError['error'];
        }

        return {
          message: `${prefix}: ${error.message}`,
          extensions: {
            code: error.extensions?.status || 500,
            timestamp: new Date().toISOString(),
            path: error.path,
            // omit the stack trace
          },
        };
      },
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    AuthModule,
    ProductsModule,
    ImagesModule,
    PaymentsModule,
    CategoriesModule,
    CartsModule,
    OrdersModule,
    LikesModule,
    EmailsModule,
  ],
})
export class AppModule {}
