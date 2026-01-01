import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OpenAlexWork } from '@org/models';
@Injectable()
export class WorksService {
  base = this.config.get<string>('OPENALEX_BASE_URL');
  works = this.config.get<string>('OPENALEX_WORKS_ENDPOINT');

  constructor(private config: ConfigService, private http: HttpService) {}

    async getWorkById(id: string) {
    const url = `${this.base}${this.works}/${id}`;
// TODO: Vérifier log 3 fois par demande
    const response = await firstValueFrom(this.http.get(url));
    console.log('Response data in WorksService:', response.data.display_name);
    return response.data as OpenAlexWork;
  }
}
