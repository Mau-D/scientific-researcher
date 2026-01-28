import { Module } from '@nestjs/common';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';
import { HttpModule } from '@nestjs/axios';



@Module({ imports: [HttpModule], controllers: [WorksController], providers: [WorksService] })
export class WorksModule {}
