import { Controller, Get } from '@nestjs/common';
import { WorksService } from './works.service';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}
  @Get('latest-title')
  async getLatestTitle() {
    const title = await this.worksService.getWorkTitle();
    return { title }; // On retourne un objet, c'est mieux pour l'extensibilité
  }
}
