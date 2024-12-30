import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './services/authentication/auth.service';
import { PrismaService } from './services/prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphqlModule } from './gql/graphql.module';
import { PaymentsController } from './controllers/payments/payments.controller';
import { ImagesModule } from './modules/images/images.module';
import Joi from 'joi';
import { GraphQLError, GraphQLFormattedError } from 'graphql/error';
import { StripeService } from './services/stripe/stripe/stripe.service';

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
      }),
    }),
    AuthModule,
    ProductsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      //typePaths: ['src/gql/schema.graphql'],
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/gql/schema.gql'),
      // subscriptions: {
      //   'graphql-ws': true,
      // },
      // definitions: {
      //   path: join(process.cwd(), 'src/gql/graphql.ts'),
      //   outputAs: 'class',
      //   emitTypenameField: true,
      // },
      definitions: {
        path: join(process.cwd(), 'src/gql/graphql.ts'),
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
    GraphqlModule,
    ImagesModule,
  ],
  controllers: [AppController, PaymentsController],
  providers: [AppService, AuthService, PrismaService, StripeService],
})
export class AppModule {}
