import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './services/authentication/auth.service';
import { PrismaService } from './services/prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersController } from './controllers/users/users.controller';
import { ProductsModule } from './modules/products/products.module';
import { ProductsController } from './controllers/products/products.controller';
import { ProductsService } from './services/products/products.service';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProductsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['src/gql/schema.graphql'],
      playground: false,
      // subscriptions: {
      //   'graphql-ws': true,
      // },
      definitions: {
        path: join(process.cwd(), 'src/gql/graphql.ts'),
        outputAs: 'class',
        emitTypenameField: true,
      },
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
  ],
  controllers: [AppController, UsersController, ProductsController],
  providers: [AppService, AuthService, PrismaService, ProductsService],
})
export class AppModule {}
