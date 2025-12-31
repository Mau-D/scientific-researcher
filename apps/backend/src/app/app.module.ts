import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorksController } from './works/works.controller';
import { WorksService } from './works/works.service';
import { WorksModule } from './works/works.module';

@Module({
  imports: [WorksModule],
  controllers: [AppController, WorksController],
  providers: [AppService, WorksService],
})
export class AppModule {}
