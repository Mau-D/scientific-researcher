import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@org/config';
import { OpenAlexWork, OpenAlexResponse, OpenAlexFilters } from '@org/models';
import { Observable, of } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class OpenalexApi {
  private readonly http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  // search(query: string) {
  //   console.log('Searching for query:', query);
  //   return this.http.get<string[]>('/api/keywords', {
  //     params: { q: query }
  //   }
  // );
  // }
  private readonly keywords: string[] = [
    'Artificial Intelligence',
    'Angular',
    'Automation',
    'Analytics',
    'API Design',
    'Blockchain',
    'Cloud Computing',
    'Cybersecurity',
    'Data Science'
  ];

  search(query: string): Observable<string[]> {
    const q = query.toLowerCase();

    return of(
      this.keywords
        .filter(keyword =>
          keyword.toLowerCase().includes(q)
        )
        .slice(0, 10) // limite résultats
    );
  }
  // workId = 'W2741809807';
  getDatasWork(id: string) {
    return this.http.get<OpenAlexWork>(`${this.baseUrl}/works/${id}`);
  }
  getWorksList(count: string, filters: string) {
    console.log('Fetching works list with count:', count, filters);
    return this.http.get<OpenAlexResponse<OpenAlexWork>>(
      `${this.baseUrl}/works?sample=${count}&filters=${filters}`
    );
  }
}
