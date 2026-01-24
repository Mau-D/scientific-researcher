import { Controller, Get, Param, Query} from '@nestjs/common';
import { WorksService } from './works.service';
import { OpenAlexResponse, OpenAlexWork } from '@org/models';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}
  @Get()
 async getSampleWorks(@Query() query: { sample: string; language: string }): Promise<OpenAlexResponse<OpenAlexWork>> {
    console.log('WorksController - getSampleWorks called with query:', query);
  return await this.worksService.getWorksSample(query.sample, query.language);
  }
  @Get(':id')
  async getWork(@Param('id') id: string): Promise<OpenAlexWork> {
    return await this.worksService.getWorkById(id);
  }
}
