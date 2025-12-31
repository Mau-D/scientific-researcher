import { Injectable } from '@nestjs/common';

@Injectable()
export class WorksService {
    async getWorkTitle(): Promise<string> {
    //TODO: Plus tard, ici : appel vers https://api.openalex.org/works/...
    return "Titre de l'œuvre depuis OpenAlex (via NestJS)";
  }
}
