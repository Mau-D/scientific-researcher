import {
  Component,
  inject,
  resource,
  signal
} from '@angular/core';
import { firstValueFrom } from 'rxjs'; // Pour gérer le cas initial
import { OpenAlexWork } from '@org/models';
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
  searchId = signal<string | undefined>(undefined);
  workResource = resource<OpenAlexWork | undefined, string | undefined>({
    // params: () => this.trigger(),
    params: () => this.searchId(),
    loader: async ({ params: id }) => {
      if (!id) return undefined;
      const datas = await firstValueFrom(this.api.getDatasWork(id));
      // console.log('Fetching work data from OpenAlexApi...', datas.display_name);

      return datas;
    },
  });
  // Getters pour simplifier l'accès dans le template
  //   .value() : La dernière valeur reçue avec succès (Signal).
  // .isLoading() : true si une requête est en cours (Signal).
  // .error() : Contient l'objet d'erreur si la requête échoue (Signal).
  // .status() : L'état précis (Idle, Loading, Resolved, Error).
  // .reload() : Une méthode pour forcer manuellement le rafraîchissement.

// Alias pour le template
  workData = this.workResource.value;
  isLoading = this.workResource.isLoading;
  error = this.workResource.error;
// Méthode pour mettre à jour la recherche
//   performSearch(newId: string): void {
//     this.searchId.set(newId);
//   }
// }
}
