import { HttpService } from '@nestjs/axios';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KeywordsService {
  constructor(private config: ConfigService, private http: HttpService) {}

  base = this.config.get<string>('OPENALEX_BASE_URL');
  keywordEndpoint = this.config.get<string>('OPENALEX_KEYWORDS_ENDPOINT');

  async findAll(query: string): Promise<string[]> {
    const url = `${this.base}${this.keywordEndpoint}?search=${query}`;
    console.log('KeywordsService - findAll URL:', url);
    // return['artificial Intelligence', 'YO']
    try {
      const { data } = await firstValueFrom(this.http.get(url));
      const q = query;
      const keywords = data.results
        .map((k) => k.display_name)
        .filter((keyword) => keyword.toLowerCase().includes(q)) // filtre non null
        .sort((a, b) => {
          const aStart = a.toLowerCase().startsWith(q.toLowerCase());
          const bStart = b.toLowerCase().startsWith(q.toLowerCase());

          if (aStart && !bStart) return -1; // 'a' commence par le terme, on le remonte
          if (!aStart && bStart) return 1; // 'b' commence par le terme, on le descend
          return a.localeCompare(b); // Sinon, tri alphabétique classique
        })

        // .slice(0, 100); //OpenAlex fourni 25 mots-clés par défaut
      // console.log('Nombre de Résultats', data.results.length);
      // console.log('KeywordsService - findAll keywords:', keywords);
      // console.log('Nombre de Résultats', data.results.length);

      return keywords;
    } catch (err) {
      console.error('ERROR', err);

      throw new HttpException(
        'Erreur lors de l’appel à OpenAlex',
        HttpStatus.BAD_GATEWAY
      );
    }
  }
}
