import { Controller, Get, Param, Query} from '@nestjs/common';
import { WorksService } from './works.service';
import { OpenAlexFilters, OpenAlexResponse, OpenAlexWork } from '@org/models';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}
  @Get()
 async getSampleWorks(@Query() query: { sample: string; filters: string }): Promise<OpenAlexResponse<OpenAlexWork>> {
    console.log('WorksController - getSampleWorks called with query:', query, query.filters);
  return await this.worksService.getWorksSample(query.sample, query.filters);
  }
  @Get(':id')
  async getWork(@Param('id') id: string): Promise<OpenAlexWork> {
    return await this.worksService.getWorkById(id);
  }
}
