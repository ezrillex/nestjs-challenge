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
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    GraphqlModule,
    ImagesModule,
  ],
  controllers: [AppController, PaymentsController],
  providers: [AppService, AuthService, PrismaService],
})
export class AppModule {}
