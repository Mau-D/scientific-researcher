import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@org/config';
import { OpenAlexWork } from '@org/models';
@Injectable({
  providedIn: 'root',
})
export class OpenalexApi {
  private readonly http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;
  // workId = 'W2741809807';
  getDatasWork(id: string) {
    const result = this.http.get<OpenAlexWork>(`${this.baseUrl}/works/${id}`);
    // TODO: Optimiser ce code et utiliser la meilleure structure possible
    return result;
  }
}
