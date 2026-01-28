import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAlexResponse, OpenAlexWork } from '@org/models';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class WorksService {
  base = this.config.get<string>('OPENALEX_BASE_URL');
  works = this.config.get<string>('OPENALEX_WORKS_ENDPOINT');

  constructor(private config: ConfigService, private http: HttpService) {}

  async getWorkById(id: string) {
    const url = `${this.base}${this.works}/${id}`;
    // On fait l'appel. Si Axios (httpService) reçoit une erreur 404/500,
    // il lèvera une exception automatiquement.
    const { data } = await firstValueFrom(this.http.get<OpenAlexWork>(url));
    if (!data) {
      // Si l'API répond 200 mais sans données, on lance l'erreur manuellement
      throw new NotFoundException(`Work with ID ${id} not found`);
    }
    return data;
  }
  async getWorksSample(
    sample: string,
    filters: string
  ): Promise<OpenAlexResponse<OpenAlexWork>> {
    const urlSample = `${this.base}${this.works}?sample=${sample}`;
    const url = !filters ? `${urlSample}` : `${urlSample}&filter=${filters}`;

    console.log(
      'WorksService - getWorksSample URL:',
      url,
      ' with filters:',
      filters
    );
    // On fait l'appel. Si Axios (httpService) reçoit une erreur 404/500,
    // il lèvera une exception automatiquement.
    try {
      const { data } = await firstValueFrom(
        this.http.get<OpenAlexResponse<OpenAlexWork>>(url)
      );

      return data;
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l’appel à OpenAlex',
        HttpStatus.BAD_GATEWAY,
        error
      );
    }
  }
}
