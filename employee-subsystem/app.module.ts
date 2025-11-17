import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './src/employee/employee.module';
import { OrganizationStructureModule } from './src/organization-structure/organization-structure.module';
import { NotificationModule } from './src/notification/notification.module';
import { ProfileChangeRequestModule } from './src/profile-change-request/profile-change-request.module';
import { AuthModule } from './src/auth/auth.module';

@Module({
  imports: [
    //.env
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule], 
      useFactory: (configService: ConfigService) => ({
        //Get URI from .env
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService], 
    }),

    EmployeeModule,
    OrganizationStructureModule,
    NotificationModule,
    ProfileChangeRequestModule,
    AuthModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}