import {
  Component,
  inject,
  resource,
  signal,
  viewChild,
  effect,
  computed,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import {
  OpenAlexFilters,
  OpenAlexResponse,
  OpenAlexWork,
  OpenAlexMeta,
} from '@org/models';
import { OpenalexApi } from '@org/research';
import { ResearchCard } from '@org/ui-layout';
import { firstValueFrom } from 'rxjs'; // Pour gérer le cas initial
import { WorkDetails } from '../work-details/work-details';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';

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
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  currentWork: OpenAlexWork | undefined;
  private api = inject(OpenalexApi);
  private formBuilder = inject(FormBuilder);
  drawer = viewChild(MatDrawer);

  filtersForm = this.formBuilder.group({
    isOa: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
    hasAbstract: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
    hasPdf: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
    hasOaAcceptedOrPublishedVersion: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
    language: new FormControl<string[]>(['fr', 'en']), // Valeur par défaut en français
  });
  debouncedSearch = signal('');
  search = signal('');
  searchSelected = signal('');

  public idClicked = signal<string>('');
  sampleWorks = signal<string | undefined>(undefined);
  filtersToApply = signal<OpenAlexFilters>({});
  constructor() {
    effect(() => {
      const value = this.search();
      console.log('constructor:Search input changed:', value);
      const timeout = setTimeout(() => {
        this.debouncedSearch.set(value);
      }, 300);

      return () => clearTimeout(timeout);
    });
  }
  searchQuery = computed(() => {
    const value = this.search().trim();
    console.log('Computed searchQuery:', value);
    return value.length >= 2 ? value : null;
  });
  keywords = computed(() => {
    console.log('Computed keywords called:', this.keywordsResource.value());
    return this.keywordsResource.value() ?? [];
  });
  onSelect(event: MatAutocompleteSelectedEvent) {
    this.getFilters();
    const value: string = event.option.value;
    console.log('event Value:   ', value);
    this.searchSelected.set(value);
  }
  toggleDrawer() {
    this.drawer()?.toggle();
  }

  onCardClicked(id: string): void {
    this.idClicked.set(id);
    this.toggleDrawer();
    console.log('Card clicked');
  }
  getResults(sampleCount: string): void {
    this.sampleWorks.set(sampleCount);
    this.filtersToApply.set({
      language: this.filtersForm.value.language?.join('|') || '',
      is_oa: this.filtersForm.value.isOa,
      has_abstract: this.filtersForm.value.hasAbstract,
      'has_content.pdf': this.filtersForm.value.hasPdf,
      has_oa_accepted_or_published_version:
        this.filtersForm.value.hasOaAcceptedOrPublishedVersion,
    });
    console.log('Get results clicked with sample count:', sampleCount);
    console.log('Language filter:', this.filtersForm.value.language);
    console.log('Filters to apply:', this.filtersToApply());
    console.log('count signal:', this.sampleWorks());
  }
  getFilters(): void {
    this.filtersToApply.set({
      language: this.filtersForm.value.language?.join('|') || '',
      is_oa: this.filtersForm.value.isOa,
      has_abstract: this.filtersForm.value.hasAbstract,
      'has_content.pdf': this.filtersForm.value.hasPdf,
      has_oa_accepted_or_published_version:
        this.filtersForm.value.hasOaAcceptedOrPublishedVersion,
    });
    console.log('2Language filter:', this.filtersForm.value.language);
    console.log('2Filters to apply:', this.filtersToApply());
  }
  // getNumberWorks(){
  //   //  this.sampleWorks.set(sampleCount);
  //     this.filtersToApply.set({
  //       language: this.filtersForm.value.language?.join('|') || '',
  //       is_oa: this.filtersForm.value.isOa,
  //       has_abstract: this.filtersForm.value.hasAbstract,
  //       'has_content.pdf': this.filtersForm.value.hasPdf,
  //       has_oa_accepted_or_published_version:
  //         this.filtersForm.value.hasOaAcceptedOrPublishedVersion,
  //     });
  // }
  toggleScroll(isOpened: boolean) {
    if (isOpened) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }
  keywordsResource = resource<string[] | null, string | null>({
    params: () => this.searchQuery(),
    loader: async ({ params }) => {
      if (!params) return null;
      const response = await firstValueFrom(this.api.getKeywordsList(params));
      console.log('Keywords response:', response);
      return response;
    },
  });
  // keywordsResource = resource<string[], string >({
  //   params: () => this.searchQuery(),
  //   loader:  (params) => {
  //     if (!params) return [];
  //     const response =  this.api.getKeywordsList(params);
  //     console.log('Keywords response:', response);
  //     return response ;
  //   },
  // });
  workResource = resource<OpenAlexWork | undefined, string | undefined>({
    params: () => this.idClicked(),
    loader: async ({ params: id }) => {
      if (!id) return undefined;
      const datas = await firstValueFrom(this.api.getDatasWork(id));
      return datas;
    },
  });

  worksResource = resource<
    OpenAlexResponse<OpenAlexWork>,
    { sampleWorks: string | undefined; filters: OpenAlexFilters }
  >({
    params: () => ({
      sampleWorks: this.sampleWorks(),
      filters: this.filtersToApply(),
    }),
    loader: async ({ params }) => {
      const filters: string = Object.keys(params.filters)
        .filter((key) => {
          const value = (params.filters as OpenAlexFilters)[
            key as keyof OpenAlexFilters
          ];
          return value !== false && value !== '';
        })
        .map(
          (key) =>
            `${key}:${
              (params.filters as OpenAlexFilters)[key as keyof OpenAlexFilters]
            }`
        )
        .join(',');
      // Ici, params est ton objet { sample, language }
      console.log(
        'Loader worksResource triggered with params:',
        params.sampleWorks,
        filters
      );
      if (!params.sampleWorks || params.sampleWorks === '0') {
        console.log('Retour VIDE Work resource');
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
  worksMetaResource = resource<
    OpenAlexResponse<OpenAlexWork>,
    { search: string|undefined; filters: OpenAlexFilters }
  >({
    params: () => ({
      search: this.searchSelected(),
      filters: this.filtersToApply()
    }),
    loader: async ({ params }) => {
      const filters: string = Object.keys(params.filters)
        .filter((key) => {
          const value = (params.filters as OpenAlexFilters)[
            key as keyof OpenAlexFilters
          ];
          return value !== false && value !== '';
        })
        .map(
          (key) =>
            `${key}:${
              (params.filters as OpenAlexFilters)[key as keyof OpenAlexFilters]
            }`
        )
        .join(',');
      // Ici, params est ton objet { sample, language }
      console.log(
        'Loader worksMetaResource triggered with params:',
        params.search,
        filters
      );
      if (!params.search || params.search === '') {
        console.log('Retour VIDE Meta resource');

        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      // Appel à votre API
      // firstValueFrom transforme votre Observable en Promise (requis par le loader)
      // const metaDatas = await firstValueFrom(
      //   this.api.getMetaWork(params.search.toLowerCase(), filters)
      // );
      const perPage = '1';
      const page = '1';
      const metaDatas = await firstValueFrom(
        
        this.api.getMetaWork(params.search.toLocaleLowerCase(), perPage, page, filters)
      );
      console.log('Meta Datas:  ', metaDatas);
      return metaDatas;
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
