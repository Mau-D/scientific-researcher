import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@org/config';
@Injectable({
  providedIn: 'root',
})
export class OpenalexApi {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/openalex`;
  // TODO: Define methods to interact with the OpenAlex API
  // search(query: string) {
  //   return this.http.get(`${this.baseUrl}/works`, {
  //     params: { q: query }
  //   });
  // }
  search() {
    console.log(this.baseUrl);
    console.log('OpenalexApi search method called');
    return this.http.get<string[]>(`${this.baseUrl}/api`);
  }
}
