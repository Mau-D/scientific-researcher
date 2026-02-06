import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@org/config';
import { OpenAlexResponse, OpenAlexWork, OpenAlexMeta, OpenAlexGroupBy, OpenAlexGroupByResult } from '@org/models';
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
    console.log('Fetching works list with count:', count, filters);
    return this.http.get<OpenAlexResponse<OpenAlexWork>>(
      `${this.baseUrl}/works?`,
      { params: { sample: count, filters } }
    );
  }
  getKeywordsList(query: string) {
    console.log('Fetching keywords list with query:', query);
    const searchInput = query.toLowerCase();
    return this.http.get<string[]>(`${this.baseUrl}/keywords?`, {
      params: { query:searchInput },
    });
  }
  // getMetaWork(search: string, perPage:string, page:string, filters: string) {
  //   console.log('Fetching works list with count:', search, filters, perPage, page);
  //   return this.http.get<OpenAlexResponse<OpenAlexWork>>(
  //     `${this.baseUrl}/works?`,
  //     { params: { research: search, perPage, page, filters } }
  //   );
  // } 
  
  getResultWorks(search: string, perPage:string, page:string, filters: string) {
    console.log('Fetching works list with count:', search, filters, perPage, page);
    return this.http.get<OpenAlexResponse<OpenAlexWork>>(
      `${this.baseUrl}/works?`,
      { params: { research: search, perPage, page, filters } }
    );
  }
  getMetaWorks(search: string, filters: string) {
    console.log('Fetching meta :', search, filters);
    return this.http.get<OpenAlexResponse<OpenAlexWork>>(
      `${this.baseUrl}/works/meta`,
      { params: { research: search, filters } }
    );
  }
  getDomainsWorks(search: string, filters: string) {
    console.log('Fetching Domains :', search, filters);
    return this.http.get<OpenAlexGroupBy<OpenAlexGroupByResult>>(
      `${this.baseUrl}/works/group-by-domain`,
      { params: { research: search, filters } }
    );
  }
}
//TODO: Renommer les fonctions voir stratégie avec petit échantillom per-page=1