import { Controller, Get, Param, Req, Request } from '@nestjs/common';
import { WorksService } from './works.service';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}
  @Get()
  findAll(@Req() request: Request): string {
    console.log(request.headers);
    return 'This action returns all works';
  }
  @Get(':id')
  async getWork(@Param('id') id: string) {
    const work = await this.worksService.getWorkById(id);
    return  work ;
  }
}
