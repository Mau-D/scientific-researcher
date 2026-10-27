import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@org/config';
import {
  OpenAlexGroupBy,
  OpenAlexGroupByResult,
  OpenAlexResponse,
  OpenAlexWork,
} from '@org/models';
@Injectable({
  providedIn: 'root',
})
export class OpenalexApi {
  private readonly http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  getDatasWork(id: string) {
    return this.http.get<OpenAlexWork>(`${this.baseUrl}/works/${id}`);
  }
  getWorksList(count: string, filters: string) {
    return this.http.get<OpenAlexResponse<OpenAlexWork>>(
      `${this.baseUrl}/works?`,
      { params: { sample: count, filters } }
    );
  }
  getKeywordsList(query: string) {
    const searchInput = query.toLowerCase();
    return this.http.get<string[]>(`${this.baseUrl}/keywords?`, {
      params: { query: searchInput },
    });
  }
  getResultWorks(
    search: string,
    perPage: string,
    filters: string,
    cursor:string
  ) {
    return this.http.get<OpenAlexResponse<OpenAlexWork>>(
      `${this.baseUrl}/works?`,
      { params: { research: search, perPage,  filters, cursor } }
    );
  }
  getMetaWorks(search: string, filters: string) {
    return this.http.get<OpenAlexResponse<OpenAlexWork>>(
      `${this.baseUrl}/works/meta`,
      { params: { research: search, filters } }
    );
  }
  getDomainsWorks(search: string, filters: string) {
    return this.http.get<OpenAlexGroupBy<OpenAlexGroupByResult>>(
      `${this.baseUrl}/works/group-by-domain`,
      { params: { research: search.toLocaleLowerCase(), filters } }
    );
  }
  getTypesWorks(search: string, filters: string) {
    return this.http.get<OpenAlexGroupBy<OpenAlexGroupByResult>>(
      `${this.baseUrl}/works/group-by-type`,
      { params: { research: search.toLocaleLowerCase(), filters } }
    );
  }
}
//TODO: Renommer les fonctions voir stratégie avec petit échantillom per-page=1
