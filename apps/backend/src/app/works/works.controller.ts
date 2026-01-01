import { Controller, Get, Param } from '@nestjs/common';
import { WorksService } from './works.service';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}
  @Get('work-id/:id')
  async getWork(@Param('id') id: string) {
    const work = await this.worksService.getWorkById(id);
    return  work ;
  }
}
