import { Component, inject, signal, resource, type ResourceLoaderParams  } from '@angular/core';
import { firstValueFrom } from 'rxjs'; // Pour gérer le cas initial
import { OpenalexApi } from '@org/research';
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

  workResource = resource<{ title: string } | undefined, number>({
    params: () => this.trigger(),

    loader: async ({ params }: ResourceLoaderParams<number>) => {
      if (params === 0) return undefined;

      return await firstValueFrom(
        this.api.getLatestWorkTitle()
      );
    },
  });

  
  search() {
    this.api.search();
  }
}
