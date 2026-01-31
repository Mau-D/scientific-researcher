import { Controller, Get, Param, Query } from '@nestjs/common';
import { OpenAlexResponse, OpenAlexWork, OpenAlexMeta } from '@org/models';
import { WorksService } from './works.service';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}
  @Get()
  async getMetaWorks(
    @Query('research') research: string,
    @Query('filters') filters?: string,
  ): Promise<OpenAlexResponse<OpenAlexWork>> {
    console.log(
      'WorksController - getSampleWorks called with query:',
      research,
      filters
    );
    return await this.worksService.getWorksMeta(research, filters);
  } 
  // async getSampleWorks(
  //   @Query('sample') sample: string,
  //   @Query('filters') filters: string,
  // ): Promise<OpenAlexResponse<OpenAlexWork>> {
  //   console.log(
  //     'WorksController - getSampleWorks called with query:',
      
  //     filters
  //   );
  //   return await this.worksService.getWorksSample(sample, filters);
  // }
  @Get(':id')
  async getWork(@Param('id') id: string): Promise<OpenAlexWork> {
    return await this.worksService.getWorkById(id);
  }
  //  @Get('search')
  //  async getMetaWorks(@Query('query') query: {filters: string, search:string }): Promise<OpenAlexResponse<OpenAlexWork>> {
  //     console.log('WorksController - getMetaWorks called with query:', query, query.filters);
  //   return await this.worksService.getMetaWorks(query.filters, query.search);
  //   }
  // @Get('search')
  // async getMetaWorks(
  //  @Query() query: { search: string; filters: string }
  // ): Promise<OpenAlexResponse<OpenAlexWork>> {
  //   console.log(query.search, query.filters);

  //   return this.worksService.getMetaWorks(query.search, query.filters);
  // }
  // @Get('search')
  // async getMetaWorks(
  //   @Query('sample') sample: string,
  //   @Query('filters') filters: string,
  // ): Promise<OpenAlexResponse<OpenAlexWork>> {
  //   console.log(
  //     'WorksController - getSampleWorks called with query:',
  //     sample, filters
  //   );
  //   return await this.worksService.getWorksSample(sample, filters);
  // }
}
