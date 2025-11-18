import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RecruitmentModule } from './Recruitment/rec.module';
import { OnBoardingModule } from './OnBoarding/OnBoarding.module';
import { OffBoardingModule } from './OffBoarding/OffBoarding.module';

@Module({
  imports: [
    RecruitmentModule,
    OnBoardingModule,
    OffBoardingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}