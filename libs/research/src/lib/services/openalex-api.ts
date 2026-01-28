import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@org/config';
import { OpenAlexWork, OpenAlexResponse, OpenAlexFilters } from '@org/models';
import { Observable, of, firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class OpenalexApi {
  private readonly http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  private readonly keywords: string[] = [
    'Artificial Intelligence',
    'Architecture',
    'Angular',
    'Automation',
    'Analytics',
    'API Design',
    'Blockchain',
    'Cloud Computing',
    'Cybersecurity',
    'Data Science',
    'Intelligence émotionnelle',
  ];

  // search(query: string): string[] | Promise<string[]> {
  //   const q = query.toLowerCase();
  //   return this.keywords
  //     .filter((keyword) => keyword.toLowerCase().includes(q)) // filtre non null
  //     .sort((a, b) => {
  //       const aStart = a.toLowerCase().startsWith(q.toLowerCase());
  //       const bStart = b.toLowerCase().startsWith(q.toLowerCase());

  //       if (aStart && !bStart) return -1; // 'a' commence par le terme, on le remonte
  //       if (!aStart && bStart) return 1; // 'b' commence par le terme, on le descend
  //       return a.localeCompare(b); // Sinon, tri alphabétique classique
  //     })
  //     .slice(0, 10); // limite résultats
  // }
  // workId = 'W2741809807';
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
    return this.http.get<string[]>(`${this.baseUrl}/keywords?`, {
      params:  {query} 
    });
    // return ['Artificial Intelligence', 'Architecture', 'Angular', 'Automation', 'Analytics'];
  }
}
