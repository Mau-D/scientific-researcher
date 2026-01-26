import { Component, inject, resource, signal, viewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, ɵInternalFormsSharedModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { OpenAlexFilters, OpenAlexResponse, OpenAlexWork } from '@org/models';
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
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule
],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  currentWork: OpenAlexWork | undefined;
  private api = inject(OpenalexApi);
  private formBuilder = inject(FormBuilder);


  filtersForm = this.formBuilder.group({
    isOa: new FormControl(true),
    hasAbstract: new FormControl(true),
    hasPdf: new FormControl(true),
    hasOaAcceptedOrPublishedVersion: new FormControl(true),
    language: new FormControl([ 'fr', 'en' ]), // Valeur par défaut en français
  });
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
  language = signal<string>('fr');
  sampleWorks = signal<string | undefined>(undefined);
filtersToApply = signal<OpenAlexFilters>({language: this.language(), is_oa: true, has_abstract:true, "has_content.pdf":true, has_oa_accepted_or_published_version:true});  

  worksResource = resource<OpenAlexResponse<OpenAlexWork>,{sampleWorks: string | undefined; filters: OpenAlexFilters}>({
    
    params: () => ({ sampleWorks: this.sampleWorks(), filters: this.filtersToApply() }),
    loader: async ({ params }) => {
      const filters: string = Object.keys(params.filters)
        .map((key) => `${key}:${(params.filters as OpenAlexFilters)[key as keyof OpenAlexFilters]}`)
        .join(',');
      // Ici, params est ton objet { sample, language }
      console.log(
        'Loader worksResource triggered with params:',
        params.sampleWorks,
        filters
      );
      if (!params.sampleWorks || params.sampleWorks === '0') {
        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      // Appel à votre API
      // firstValueFrom transforme votre Observable en Promise (requis par le loader)
      const list = await firstValueFrom(
        this.api.getWorksList(params.sampleWorks, filters)
      );
      return list;
    },
  });
  //  worksResource = resource<OpenAlexResponse<OpenAlexWork>, string | undefined>({
  //   params: () => this.sampleWorks(),
  //   loader: async ({ params: sample }) => {
  //     console.log('Loader worksResource triggered with sample:', sample);
  //     if (!sample || sample === '0') {
  //       // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
  //       // Pour éviter les erreurs de type, on peut retourner un objet vide typé
  //       return {} as OpenAlexResponse<OpenAlexWork>;
  //     }
  //     // Appel à votre API
  //     // firstValueFrom transforme votre Observable en Promise (requis par le loader)
  //     const list = await firstValueFrom(this.api.getWorksList(sample, this.language()));

  //     return list;
  //   },
  // });

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
