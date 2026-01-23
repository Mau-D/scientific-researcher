import { Component, inject, resource, signal, viewChild } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { OpenAlexResponse, OpenAlexWork } from '@org/models';
import { OpenalexApi } from '@org/research';
import { ResearchCard } from '@org/ui-layout';
import { firstValueFrom } from 'rxjs'; // Pour gérer le cas initial
import { WorkDetails } from '../work-details/work-details';

@Component({
  selector: 'app-search',
  imports: [
    ResearchCard,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatDrawer,
    WorkDetails,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  currentWork: OpenAlexWork | undefined;
  private api = inject(OpenalexApi);
  sampleWorks = signal<string | undefined>(undefined);

  public idClicked = signal<string>('');
  drawer = viewChild(MatDrawer);

  toggleDrawer() {
    this.drawer()?.toggle();
  }

  onCardClicked(id: string): void {

    this.idClicked.set(id);
    this.toggleDrawer();
    console.log('Card clicked');
  }
  toggleScroll(isOpened: boolean) {
    if (isOpened) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }
  workResource = resource<OpenAlexWork | undefined, string | undefined>({
    params: () => this.idClicked(),
    loader: async ({ params: id }) => {
      if (!id) return undefined;
      const datas = await firstValueFrom(this.api.getDatasWork(id));
      return datas;
    },
  });
  worksResource = resource<OpenAlexResponse<OpenAlexWork>, string | undefined>({
    params: () => this.sampleWorks(),
    loader: async ({ params: sampleCount }) => {
      if (!sampleCount || sampleCount === '0') {
        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      // Appel à votre API
      // firstValueFrom transforme votre Observable en Promise (requis par le loader)
      const list = await firstValueFrom(this.api.getWorksList(sampleCount));

      return list;
    },
  });

  // Getters pour simplifier l'accès dans le template
  //   .value() : La dernière valeur reçue avec succès (Signal).
  // .isLoading() : true si une requête est en cours (Signal).
  // .error() : Contient l'objet d'erreur si la requête échoue (Signal).
  // .status() : L'état précis (Idle, Loading, Resolved, Error).
  // .reload() : Une méthode pour forcer manuellement le rafraîchissement.

  // Alias pour le template
  workData = this.worksResource.value;
  isLoading = this.worksResource.isLoading;
  error = this.worksResource.error;
  // Méthode pour mettre à jour la recherche
  //   performSearch(newId: string): void {
  //     this.searchId.set(newId);
  //   }
  // }
}
