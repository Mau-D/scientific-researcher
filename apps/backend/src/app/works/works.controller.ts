import { Controller, Get, Param, Query} from '@nestjs/common';
import { WorksService } from './works.service';
import { OpenAlexResponse, OpenAlexWork } from '@org/models';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}
  @Get()
 async getSampleWorks(@Query('sample') sampleCount: string): Promise<OpenAlexResponse<OpenAlexWork>> {
    return await this.worksService.getWorksSample(sampleCount);
  }
  @Get(':id')
  async getWork(@Param('id') id: string): Promise<OpenAlexWork> {
    return await this.worksService.getWorkById(id);
  }
}
