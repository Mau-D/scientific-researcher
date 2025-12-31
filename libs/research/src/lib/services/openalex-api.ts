import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@org/config';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class OpenalexApi {
  private readonly http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;
  // TODO: Define methods to interact with the OpenAlex API
  // search(query: string) {
  //   return this.http.get(`${this.baseUrl}/works`, {
  //     params: { q: query }
  //   });
  // }
  search():Observable<{ message: string }> {
    console.log(this.baseUrl);
    console.log('OpenalexApi search method called');
    const result = this.http.get<{ message: string }>(`${this.baseUrl}/hello`);
    console.log(result.forEach((res) => console.log('YO C\'est mon message:',res.message)));
    return result;
  }
  getLatestWorkTitle() {

    const result = this.http.get<{  work: { display_name: string  } }>(`${this.baseUrl}/works/one-work`);
    console.log(result.forEach((res) => console.log('Display_Name',res.work.display_name)));
    return result;

  }
}
