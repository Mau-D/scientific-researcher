import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OpenAlexResponse,
  OpenAlexWork,
  OpenAlexGroupBy,
  OpenAlexGroupByResult,
} from '@org/models';
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
  async getMetaWorks(
    search: string,
    perPage: string,
    filters: string
  ): Promise<OpenAlexResponse<OpenAlexWork>> {
    const urlSample = `${this.base}${this.works}?`;
    const url = !filters
      ? `${urlSample}filter=title.search:${search}&per_page=${perPage}`
      : `${urlSample}filter=${filters},title.search:${search}&per_page=${perPage}`;
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
  async getDomainsGroupByWorks(
    search: string,
    filters: string
  ): Promise<OpenAlexGroupBy<OpenAlexGroupByResult>> {
    const urlSample = `${this.base}${this.works}?`;
    const url = !filters
      ? `${urlSample}filter=title.search:${search}&group_by=primary_topic.domain.id`
      : `${urlSample}filter=${filters},title.search:${search}&group_by=primary_topic.domain.id`;
    try {
      const { data } = await firstValueFrom(
        this.http.get<OpenAlexGroupBy<OpenAlexGroupByResult>>(url)
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
  async getTypesGroupByWorks(
    search: string,
    filters: string
  ): Promise<OpenAlexGroupBy<OpenAlexGroupByResult>> {
    const urlSample = `${this.base}${this.works}?`;
    const url = !filters
      ? `${urlSample}filter=title.search:${search}&group_by=type`
      : `${urlSample}filter=${filters},title.search:${search}&group_by=type`;
    try {
      const { data } = await firstValueFrom(
        this.http.get<OpenAlexGroupBy<OpenAlexGroupByResult>>(url)
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
  async getWorksResult(
    search: string,
    perPage: string,
    page: string,
    filters: string
  ): Promise<OpenAlexResponse<OpenAlexWork>> {
    const urlSample = `${this.base}${this.works}?`;
    const url = !filters
      ? `${urlSample}filter=title.search:${search}&per_page=${perPage}&page=${page}`
      : `${urlSample}filter=${filters},title.search:${search}&per_page=${perPage}&page=${page}`;
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
