import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class WorksService {
  base = this.config.get<string>('OPENALEX_BASE_URL');
  works = this.config.get<string>('OPENALEX_WORKS_ENDPOINT');

  constructor(private config: ConfigService, private http: HttpService) {}

  async getWorkTitle(): Promise<string> {
    //TODO: Plus tard, ici : appel vers https://api.openalex.org/works/...
    return "Titre de l'œuvre depuis OpenAlex (via NestJS)";
  }
  async getUrl(): Promise<unknown> {
    return `${this.base}${this.works}`;
  }
  async getWorkById(id: string) {
    const url = `${this.base}${this.works}/${id}`;

    const response = await firstValueFrom(this.http.get(url));
    console.log('Response data in WorksService:', response.data.display_name);
    return response.data;
  }
}
