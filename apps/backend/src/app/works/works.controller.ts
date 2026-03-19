import { Controller, Get, Param, Query } from '@nestjs/common';
import { OpenAlexGroupBy, OpenAlexGroupByResult, OpenAlexResponse, OpenAlexWork } from '@org/models';
import { WorksService } from './works.service';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}
  @Get()
  async getWorks(
    @Query('research') research: string,
    @Query('perPage') perPage: string,
    @Query('page') page: string,
    @Query('filters') filters?: string,
    @Query('cursor') cursor?: string
  ): Promise<OpenAlexResponse<OpenAlexWork>> {
    return await this.worksService.getWorksResult(
      research,
      perPage,
      page,
      filters,
      cursor
    );
  }
  @Get('meta')
  async getMeta(
    @Query('research') research: string,
    @Query('filters') filters?: string
  ): Promise<OpenAlexResponse<OpenAlexWork>> {
    return await this.worksService.getMetaWorks(research, '1', filters);
  }
   @Get('group-by-domain')
  async getDomainsGroupBy(
    @Query('research') research: string,
    @Query('filters') filters?: string
  ): Promise<OpenAlexGroupBy<OpenAlexGroupByResult>> {
    return await this.worksService.getDomainsGroupByWorks(research, filters);
  }
   @Get('group-by-type')
  async getTypesGroupBy(
    @Query('research') research: string,
    @Query('filters') filters?: string
  ): Promise<OpenAlexGroupBy<OpenAlexGroupByResult>> {
    return await this.worksService.getTypesGroupByWorks(research, filters);
  }
  
  @Get(':id')
  async getWork(@Param('id') id: string): Promise<OpenAlexWork> {
    return await this.worksService.getWorkById(id);
  }
}
