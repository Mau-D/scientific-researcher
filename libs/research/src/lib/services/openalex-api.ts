import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@org/config';
import { OpenAlexWork, OpenAlexResponse } from '@org/models';
@Injectable({
  providedIn: 'root',
})
export class OpenalexApi {
  private readonly http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;
  // workId = 'W2741809807';
  getDatasWork(id: string) {
    return this.http.get<OpenAlexWork>(`${this.baseUrl}/works/${id}`);
  }
  getWorksList(count: string) {
    return this.http.get<OpenAlexResponse<OpenAlexWork>>(
      `${this.baseUrl}/works?sample=${count}`
    );
  }
}
