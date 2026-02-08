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
  OpenAlexMeta,
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
  groupByDomains = signal<OpenAlexGroupBy<OpenAlexGroupByResult>>({
    meta: {} as OpenAlexMeta,
    group_by: [],
  });
  groupByTypes = signal<OpenAlexGroupBy<OpenAlexGroupByResult>>({
    meta: {} as OpenAlexMeta,
    group_by: [],
  });

  allDomains = computed(() => {
    return this.getDomainsArray(this.groupByDomains());
  });
  allTypes = computed(() => {
    return this.getTypesArray(this.groupByTypes());
  });
  selectedDomains = signal<string[]>([]);

  typesArray: OpenAlexGroupByResult[] = [];

  public idClicked = signal<string>('');
  sampleWorks = signal<string | undefined>(undefined);
  filtersToApply = signal<string>('');
  allFilters = signal<string>('');
  constructor() {
    effect(() => {
      const value = this.search();
      console.log('constructor:Search input changed:', value);
      const timeout = setTimeout(() => {
        this.debouncedSearch.set(value);
      }, 300);

      return () => clearTimeout(timeout);
    });
    effect(() => {
      this.formSignal();
      this.selectedDomains.set([]);
      this.setFiltersApply();
    });
  }

  searchQuery = computed(() => {
    const value = this.search().trim();
    return value.length >= 2 ? value : null;
  });

  keywords = computed(() => {
    return this.keywordsResource.value() ?? [];
  });
  //  selectedLookup = computed(() => new Set(this.selectedDomains()));

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
    const formFilters = {
      language: this.filtersForm.value.language?.join('|') || '',
      is_oa: this.filtersForm.value.isOa,
      has_abstract: this.filtersForm.value.hasAbstract,
      'has_content.pdf': this.filtersForm.value.hasPdf,
      has_oa_accepted_or_published_version:
        this.filtersForm.value.hasOaAcceptedOrPublishedVersion,
    };

    this.filtersToApply.set(this.filtersToString(formFilters));
    this.allFilters.set(this.filtersToString(formFilters));
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
    { sampleWorks: string | undefined; filters: string }
  >({
    params: () => ({
      sampleWorks: this.sampleWorks(),
      filters: this.filtersToApply(),
    }),
    loader: async ({ params }) => {
      // const filters: string = Object.keys(params.filters)
      //   .filter((key) => {
      //     const value = (params.filters as OpenAlexFilters)[
      //       key as keyof OpenAlexFilters
      //     ];
      //     return value !== false && value !== '';
      //   })
      //   .map(
      //     (key) =>
      //       `${key}:${
      //         (params.filters as OpenAlexFilters)[key as keyof OpenAlexFilters]
      //       }`
      //   )
      // .join(',');
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
        this.api.getWorksList(params.sampleWorks, params.filters)
      );
      return list;
    },
  });
  worksMetaResource = resource<
    OpenAlexResponse<OpenAlexWork>,
    { search: string | undefined; filters: string; allfilters: string }
  >({
    params: () => ({
      search: this.searchSelected(),
      filters: this.filtersToApply(),
      allfilters: this.allFilters(),
    }),
    loader: async ({ params }) => {
      if (!params.search || params.search === '') {
        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      this.pageNumber.set(0);
      const metaDatas = await firstValueFrom(
        this.api.getMetaWorks(
          params.search.toLocaleLowerCase(),
          params.allfilters
        )
      );

      console.log('Meta Datas:  ', metaDatas);
      return metaDatas;
    },
  });

  groupByDomainResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { search: string | undefined; filters: string }
  >({
    params: () => ({
      search: this.searchSelected(),
      filters: this.filtersToApply(),
    }),
    loader: async ({ params }) => {
      // const filters: string = this.filtersToString(params.filters);
      console.log('Resource GROUP_BY DOMAIN:', params.search, params.filters);
      if (!params.search || params.search === '') {
        console.log('Retour VIDE  GROUP_BY DOMAIN resource');

        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }
      this.pageNumber.set(0);
      const metaDatas = await firstValueFrom(
        this.api.getDomainsWorks(
          params.search.toLocaleLowerCase(),
          params.filters
        )
      );
      this.groupByDomains.set(metaDatas);
      this.selectedDomains.set(this.getDomainsArray(metaDatas));
      console.log('Resource GROUP_BY DOMAIN Datas:  ', metaDatas);
      // const allDomainsArray = this.getDomainsArray(metaDatas);
      // this.allDomains.set(allDomainsArray);
      // console.log(' all Domains in Resource Domain :', this.allDomains());
      // this.selectedDomains.set(allDomainsArray);
      // console.log(
      //   ' selected Domains in Resource Domain :',
      //   this.selectedDomains()
      // );

      return metaDatas;
    },
  });
  groupByTypeResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { search: string | undefined; filters: string }
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

      this.pageNumber.set(0);
      const metaDatas = await firstValueFrom(
        this.api.getTypesWorks(
          params.search.toLocaleLowerCase(),
          params.filters
        )
      );
      // this.initialTypes = metaDatas.group_by;
      this.groupByTypes.set(metaDatas);
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
      console.log('JE SUIS DANS LA RESOURCE TYPES W DOMAINS FILTER');
      const searchValue = this.searchSelected();
      if (!searchValue || !params.domains) {
        console.log('Retour VIDE Types WDomainsFilter resource');

        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }
      const allDomainsArray = this.allDomains();
      const filters = this.filtersToApply();
      if (params.domains.length < allDomainsArray.length) {
        this.allFilters.set(
          filters.concat(
            `,primary_topic.domain.id:${this.filtersDomainsToString(
              params.domains
            )}`
          )
        );

        console.log('AJOUT DES DOMAINS DANS LES FILTRES: ', filters);
      } else {
        this.allFilters.set(filters);
      }
      // this.pageNumber.set(0);
      const metaDatas = await firstValueFrom(
        this.api.getTypesWorks(searchValue, this.allFilters())
      );
      const currentArray = this.groupByTypes().group_by;
      console.log('currentArray in Resource: ', currentArray);
      this.typesArray = this.syncCounts(currentArray, metaDatas.group_by);
      // console.log(this.initialTypes, metaDatas.group_by, this.typesArray);

      console.log(
        'Resource GROUP_BY Types W Domain filter Datas:  ',
        metaDatas
      );
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
      if (!params.page || params.page === 0) {
        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      const worksDatas = await firstValueFrom(
        this.api.getResultWorks(
          search,
          '25',
          params.page.toString(),
          this.filtersToApply()
        )
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
  // toggleDomain(domain: string) {
  //   console.log('remove domain: ', domain, this.selectedDomains().length);
  //   this.selectedDomains.update(
  //     (domains) =>
  //       domains.includes(domain)
  //         ? domains.filter((d) => d !== domain) // remove
  //         : [...domains, domain] // add
  //   );

  //   console.log(
  //     ' TOGGLE Domain: ',
  //     domain,
  //     this.selectedDomains().length,
  //     'SElected Domains',
  //     this.selectedDomains()
  //   );
  // }
  toggleDomain2(domain: string, selected: boolean) {
    console.log(domain, selected);
    this.selectedDomains.update((domains) => {
      // toggle seulement si l'état actuel est différent de selected
      const isCurrentlySelected = domains.includes(domain);
      if (isCurrentlySelected === selected) {
        return domains; // pas de changement → pas de boucle
      }
      return selected
        ? [...domains, domain]
        : domains.filter((d) => d !== domain);
    });
  }
  toggleDomain(domain: string, event: Event) {
    event.stopPropagation(); // très important pour éviter que mat-chip-listbox ne traite l'événement comme selectionChange
    const current = this.selectedDomains();
    this.selectedDomains.set(
      current.includes(domain)
        ? current.filter((d) => d !== domain)
        : [...current, domain]
    );
    // this.selectedDomains.update(d =>
    //   d.includes(domain) ? d.filter(k => k !== domain) : [...d, domain]
    // );
  }
  // toggleDomain(key: string) {
  //   this.selectedDomains.update((arr) =>
  //     arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]
  //   );
  // }
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
  // hasType(type: OpenAlexGroupByResult) {
  //   const typeGroupBy =
  //     this.groupByTypeFilterByDomainsResource.value()?.group_by;
  //   return typeGroupBy?.some((t) => t.key === type.key);
  // }
  // domainInclude(domainKey: string) {
  //   // console.log('DOMAINE INCLUS: ',domain,this.selectedDomains())
  //   const response = this.selectedDomains().includes(domainKey);
  //   return response;
  // }
  syncCounts(
    current: OpenAlexGroupByResult[],
    next: OpenAlexGroupByResult[]
  ): OpenAlexGroupByResult[] {
    const nextMap = new Map(next.map((n) => [n.key, n.count]));

    const newArrayTypes = current.map((item) => ({
      ...item,
      count: nextMap.get(item.key) ?? 0,
    }));
    console.log('Array:  ', current, next);

    console.log('SyncCounts:  ', newArrayTypes);
    return newArrayTypes;
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
