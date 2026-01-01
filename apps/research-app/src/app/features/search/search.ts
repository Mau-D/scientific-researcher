import { Component, inject, signal, resource, type ResourceLoaderParams  } from '@angular/core';
import { firstValueFrom } from 'rxjs'; // Pour gérer le cas initial
import { OpenalexApi } from '@org/research';
import { OpenAlexWork } from '@org/models';
import { ResearchCard } from '@org/ui-layout';

@Component({
  selector: 'app-search',
  imports: [ResearchCard],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  private api = inject(OpenalexApi);
  trigger = signal(0);
  // On crée une méthode explicite
  incrementTrigger() {
    this.trigger.update(n => n + 1);
  }

  workResource = resource<OpenAlexWork | undefined, number>({
    params: () => this.trigger(),

    loader: async ({ params }: ResourceLoaderParams<number>) => {
      if (params === 0) return undefined;
      const datas = await firstValueFrom(
        this.api.getDatasWork()
      );
      console.log('Fetching work data from OpenAlexApi...', );
      console.log('Fetching work data from OpenAlexApi...', datas.display_name);

      return datas;
    },
  });
}
