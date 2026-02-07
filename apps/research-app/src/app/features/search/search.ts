import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import {
  OpenAlexFilters,
  OpenAlexGroupBy,
  OpenAlexGroupByResult,
  OpenAlexResponse,
  OpenAlexWork,
} from '@org/models';
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
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatBadgeModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  currentWork: OpenAlexWork | undefined;
  private api = inject(OpenalexApi);
  private formBuilder = inject(FormBuilder);
  drawer = viewChild(MatDrawer);
  initialTypes: string[] = [];
  count = 0;
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
  formSignal = toSignal(this.filtersForm.valueChanges, {
    initialValue: this.filtersForm.value,
  });
  debouncedSearch = signal('');
  search = signal('');
  searchSelected = signal('');
  pageNumber = signal(0);
  allDomains = signal<string[]>([]);
  selectedDomains = signal<string[]>([]);

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
    // effect(() => {
    //   this.formSignal();
    //   this.setFiltersApply();
    // });
  }
  searchQuery = computed(() => {
    const value = this.search().trim();
    return value.length >= 2 ? value : null;
  });
  keywords = computed(() => {

    return this.keywordsResource.value() ?? [];
  });
  onSelect(event: MatAutocompleteSelectedEvent) {
    this.setFiltersApply();
    const value: string = event.option.value;

    this.searchSelected.set(value);
  }
  toggleDrawer() {
    this.drawer()?.toggle();
  }

  onCardClicked(id: string): void {
    this.idClicked.set(id);
    this.toggleDrawer();

  }
  setFiltersApply(): void {
    // this.sampleWorks.set(sampleCount);
    this.pageNumber.set(0);
    this.filtersToApply.set({
      language: this.filtersForm.value.language?.join('|') || '',
      is_oa: this.filtersForm.value.isOa,
      has_abstract: this.filtersForm.value.hasAbstract,
      'has_content.pdf': this.filtersForm.value.hasPdf,
      has_oa_accepted_or_published_version:
        this.filtersForm.value.hasOaAcceptedOrPublishedVersion,
    });

   
    
  }

  // getFilters(): void {
  //   this.filtersToApply.set({
  //     language: this.filtersForm.value.language?.join('|') || '',
  //     is_oa: this.filtersForm.value.isOa,
  //     has_abstract: this.filtersForm.value.hasAbstract,
  //     'has_content.pdf': this.filtersForm.value.hasPdf,
  //     has_oa_accepted_or_published_version:
  //       this.filtersForm.value.hasOaAcceptedOrPublishedVersion,
  //   });
  //   console.log('2Language filter:', this.filtersForm.value.language);
  //   console.log('2Filters to apply:', this.filtersToApply());
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
      this.pageNumber.set(0);
      this.searchSelected.set('');
      const response = await firstValueFrom(this.api.getKeywordsList(params));

      return response;
    },
  });

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
    { search: string | undefined; filters: OpenAlexFilters }
  >({
    params: () => ({
      search: this.searchSelected(),
      filters: this.filtersToApply(),
    }),
    loader: async ({ params }) => {
      const filters: string = this.filtersToString(params.filters);
     
      if (!params.search || params.search === '') {

        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      this.pageNumber.set(0);
      const metaDatas = await firstValueFrom(
        this.api.getMetaWorks(params.search.toLocaleLowerCase(), filters)
      );

      console.log('Meta Datas:  ', metaDatas);
      return metaDatas;
    },
  });

  groupByDomainResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { search: string | undefined; filters: OpenAlexFilters }
  >({
    params: () => ({
      search: this.searchSelected(),
      filters: this.filtersToApply(),
    }),
    loader: async ({ params }) => {
      const filters: string = this.filtersToString(params.filters);
      console.log(
        'Resource GROUP_BY DOMAIN:',
        params.search,
        filters
      );
      if (!params.search || params.search === '') {
        console.log('Retour VIDE  GROUP_BY DOMAIN resource');

        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }
      this.pageNumber.set(0);
      const metaDatas = await firstValueFrom(
        this.api.getDomainsWorks(params.search.toLocaleLowerCase(), filters)
      );

      console.log('Resource GROUP_BY DOMAIN Datas:  ', metaDatas);
      const allDomainsArray = this.getDomainsArray(metaDatas);
      this.allDomains.set(allDomainsArray);
      console.log(' all Domains in Resource Domain :', this.allDomains())
      this.selectedDomains.set(this.getDomainsArray(metaDatas));
      console.log(' selected Domains in Resource Domain :', this.selectedDomains())

      return metaDatas;
    },
  });
  groupByTypeResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { search: string | undefined; filters: OpenAlexFilters }
  >({
    params: () => ({
      search: this.searchSelected(),
      filters: this.filtersToApply(),
    }),
    loader: async ({ params }) => {
     
      if (!params.search || params.search === '') {
        console.log('Retour VIDE GROUP_BY TYPE resource');

        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }
      const filters = this.filtersToString(this.filtersToApply());

      this.pageNumber.set(0);
      const metaDatas = await firstValueFrom(
        this.api.getTypesWorks(params.search.toLocaleLowerCase(), filters)
      );

      console.log('Resource GROUP_BY TYPE Datas:  ', metaDatas);
      return metaDatas;
    },
  });
  groupByTypeFilterByDomainsResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { domains: string[] }
  >({
    params: () => ({
      domains: this.selectedDomains(),
    }),
    loader: async ({ params }) => {
      console.log('JE SUIS DANS LA RESOURCE TYPES W DOMAINS FILTER')
      const searchValue = this.searchSelected();
       if (!searchValue || !params.domains) {
        console.log('Retour VIDE Types WDomainsFilter resource');

        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }
      let filters = this.filtersToString(this.filtersToApply());
      const allDomainsArray = this.allDomains();
      console.log('FILTERS: ', filters)
      console.log('Voir les tableaux');
      console.log('Domains selected: ',params.domains.length, params.domains);
      console.log(' All Domains : ',allDomainsArray.length, allDomainsArray);
      if (params.domains.length < allDomainsArray.length) {
        filters = filters.concat(`,primary_topic.domain.id:${this.filtersDomainsToString(params.domains)}`);
        console.log('AJOUT DES DOMAINS DANS LES FILTRES: ', filters)
      }
      
      // this.pageNumber.set(0);
      const metaDatas = await firstValueFrom(
        this.api.getTypesWorks(searchValue, filters)
      );

      console.log('Resource GROUP_BY Types W Domain filter Datas:  ', metaDatas);
      return metaDatas;
    },
  });

  worksResultResource = resource<
    OpenAlexResponse<OpenAlexWork>,
    { page: number }
  >({
    params: () => ({
      page: this.pageNumber(),
    }),
    loader: async ({ params }) => {
      // Ici, params est ton objet { sample, language }
     
      const search = this.searchSelected().toLowerCase();
      const filters = this.filtersToString(this.filtersToApply());
      if (!params.page || params.page === 0) {

        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      const worksDatas = await firstValueFrom(
        this.api.getResultWorks(search, '25', params.page.toString(), filters)
      );
      return worksDatas;
    },
  });
  getDomainsArray(domains: OpenAlexGroupBy<OpenAlexGroupByResult>) {
    const keysDomain = domains.group_by.map((g) => g.key);
    console.log('getDomainsArray:  ', keysDomain);
    return keysDomain;
  }
  getTypesArray(types: OpenAlexGroupBy<OpenAlexGroupByResult>) {
    const keysType = types.group_by.map((g) => g.key);
    console.log('getTypesArray', keysType);
    return keysType;
  }
  toggleDomain(domain: string) {
    console.log('remove domain: ', domain, this.selectedDomains().length);
    this.selectedDomains.update(
      (domains) =>
        domains.includes(domain)
          ? domains.filter((d) => d !== domain) // remove
          : [...domains, domain] // add
    );

   

    console.log(
      ' TOGGLE Domain: ',
      domain,
      this.selectedDomains().length, 'SElected Domains',
      this.selectedDomains()
    );
  }
  filtersToString(filters: OpenAlexFilters) {
    const filtersStringify = Object.keys(filters)
      .filter((key) => {
        const value = (filters as OpenAlexFilters)[
          key as keyof OpenAlexFilters
        ];
        return value !== false && value !== '';
      })
      .map(
        (key) =>
          `${key}:${(filters as OpenAlexFilters)[key as keyof OpenAlexFilters]}`
      )
      .join(',');
    console.log('FILTRES ENVOYÉS:  ', filtersStringify);
    return filtersStringify;
  }
  filtersDomainsToString(domains: string[]) {

    const domainsString = domains.map((key) => key.split('/').pop()).join('|');
    console.log('domains string:  ', domainsString);
    return domainsString;
  }
  hasType(type: OpenAlexGroupByResult){
    const typeGroupBy = this.groupByTypeFilterByDomainsResource.value()?.group_by;
      return typeGroupBy?.some(t => t.key === type.key);

  }
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
