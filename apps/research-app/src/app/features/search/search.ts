import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
  viewChild,
  untracked,
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
  countWorks = signal(0);
  pageNumber = signal(0);
  groupByDomains = signal<OpenAlexGroupBy<OpenAlexGroupByResult>>({
    meta: {} as OpenAlexMeta,
    group_by: [],
  });
  groupByTypes = signal<OpenAlexGroupBy<OpenAlexGroupByResult>>({
    meta: {} as OpenAlexMeta,
    group_by: [],
  });

  // allDomains = computed(() => {
  //   return this.getDomainsArray(this.groupByDomains());
  // });
  // allTypes = computed(() => {
  //   return this.getTypesArray(this.groupByTypes());
  // });
  selectedDomains = signal<string[]>([]);
  selectedTypes = signal<string[]>([]);
  public idClicked = signal<string>('');
  sampleWorks = signal<string | undefined>(undefined);
  filtersToApply = signal<string>('');
  allFilters = signal<string>('');
  typesArray = signal<OpenAlexGroupByResult[]>([]);
  domainsArray = signal<OpenAlexGroupByResult[]>([]);

  searchQuery = computed(() => {
    const value = this.search().trim();
    return value.length >= 2 ? value : null;
  });

  keywords = computed(() => {
    return this.keywordsResource.value() ?? [];
  });
  allDomains = computed(
    () => this.groupByDomainResource.value()?.group_by?.map((g) => g.key) ?? []
  );
  allTypes = computed(
    () => this.groupByTypeResource.value()?.group_by?.map((g) => g.key) ?? []
  );
  // unselectedDomains = computed(() => {
  //   const all = this.allDomains();
  //   const selected = this.selectedDomains();
  //   const domainsFiltered = all.filter((d) => !selected.includes(d));
  //   return domainsFiltered.map((key) => key.split('/').pop()).join('|');
  // });
  // unselectedTypes = computed(() => {
  //   const all = this.allTypes();
  //   const selected = this.selectedTypes();
  //   const typesFiltered = all.filter((d) => !selected.includes(d));
  //   return typesFiltered.join('|');
  // });

  //   domainsArray = computed(() => {
  //     console.log('DOMAINS ARRAY COMPUTED')
  //     const filtered =
  //       this.groupByDomainFilterByTypesResource.value()?.group_by ?? [];

  //     const current = this.groupByDomains().group_by ?? [];

  //     return this.syncCounts(current, filtered);
  //   });
  //   typesArray = computed(() => {
  // console.log('TYPES ARRAY COMPUTED')
  //     const filtered =
  //       this.groupByTypeFilterByDomainsResource.value()?.group_by ?? [];

  //     const current = this.groupByTypes().group_by ?? [];

  //     return this.syncCounts(current, filtered);
  //   });
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
      this.setFiltersApply();
      this.selectedDomains.set([]);
      this.selectedTypes.set([]);
    });
    effect(() => {
      const query = this.searchQuery();
      if (!query) return;
      this.pageNumber.set(0);
      this.searchSelected.set('');
    });
    // effect(() => {
    //   const query = this.searchSelected();
    //   const datasDomains = this.groupByDomainResource.value();
    //   const datasTypes = this.groupByTypeResource.value();
    //   if (!query || !datasDomains || !datasTypes) return;
    //   const domainsArray = datasDomains?.group_by?.map((g) => g.key) ?? [];
    //   const TypesArray = datasTypes?.group_by?.map((g) => g.key) ?? [];

    //   this.pageNumber.set(0);
    //   this.groupByDomains.set(datasDomains);
    //   this.groupByTypes.set(datasTypes);

    //   this.countWorks.set(datasDomains.meta.count);

    //   this.selectedDomains.set(domainsArray);
    //   this.selectedTypes.set(TypesArray);
    // });
    effect(() => {
      const query = this.searchSelected();
      const datasDomains = this.groupByDomainResource.value();
      const datasTypes = this.groupByTypeResource.value();

      if (!query || !datasDomains || !datasTypes) return;

      const domainsKeys = datasDomains.group_by?.map((g) => g.key) ?? [];
      const typesKeys = datasTypes.group_by?.map((g) => g.key) ?? [];
      this.allFilters.set(this.filtersToApply());

      // -------------------------
      // 🔹 Init state (NON TRACKÉ)
      // -------------------------
      untracked(() => {
        this.pageNumber.set(0);

        this.groupByDomains.set(datasDomains);
        this.groupByTypes.set(datasTypes);

        this.countWorks.set(datasDomains.meta.count);

        // IMPORTANT : init seulement si vide
        if (!this.selectedDomains().length) {
          this.selectedDomains.set(domainsKeys);
        }

        if (!this.selectedTypes().length) {
          this.selectedTypes.set(typesKeys);
        }
        // 🔹 initialise aussi tes arrays ici
        this.domainsArray.set(datasDomains.group_by ?? []);
        this.typesArray.set(datasTypes.group_by ?? []);
      });
    });
    effect(() => {
      const selectedDomains = this.selectedDomains();
      const selectedTypes = this.selectedTypes();
      console.log('selected Domains and Types', selectedDomains, selectedTypes);
      const allDomains = this.allDomains();
      const allTypes = this.allTypes();
      console.log('all Domains and Types', allDomains, allTypes);

      const baseFilters = this.filtersToApply();

      if (!allDomains?.length || !allTypes?.length) return;

      // -------------------------
      // 🔹 Build UNSELECTED
      // -------------------------

      const unselectedDomains = allDomains
        .filter((d) => !selectedDomains.includes(d))
        .map((d) => d.split('/').pop())
        .join('|');
      console.log('unselected domains:  ', unselectedDomains);
      const unselectedTypes = allTypes
        .filter((t) => !selectedTypes.includes(t))
        .map((d) => d.split('/').pop())
        .join('|');
      console.log('unselected types:  ', unselectedTypes);

      // -------------------------
      // 🔹 Build FILTER STRING
      // -------------------------

      const nextFilters = [
        baseFilters,
        unselectedDomains && `primary_topic.domain.id:!${unselectedDomains}`,
        unselectedTypes && `type:!${unselectedTypes}`,
      ]
        .filter(Boolean)
        .join(',');

      // 🔹 IMPORTANT : évite set inutile → évite refresh resource
      if (this.allFilters() !== nextFilters) {
        this.allFilters.set(nextFilters);
      }

      console.log('ALL FILTERS →', nextFilters);

      // -------------------------
      // 🔹 Update count
      // -------------------------

      const count =
        this.groupByTypeFilterByDomainsResource.value()?.meta?.count ??
        this.groupByDomainFilterByTypesResource.value()?.meta?.count ??
        this.countWorks();

      this.countWorks.set(count);

      // -------------------------
      // 🔹 Sync arrays
      // -------------------------
      const nextTypes =
        this.groupByTypeFilterByDomainsResource.value()?.group_by ?? [];
      // this.typesArray.update((curr) => this.syncCounts(curr, nextTypes));

      this.typesArray.set(this.syncCounts(this.groupByTypes().group_by, nextTypes));
      console.log('curr Types',this.groupByTypes().group_by,'nextTypes:  ', nextTypes);

      const nextDomains =
        this.groupByDomainFilterByTypesResource.value()?.group_by ?? [];
      console.log('curr Domains', this.groupByDomains().group_by,'nextDomains:  ', nextDomains);
      this.domainsArray.set(this.syncCounts(this.groupByDomains().group_by, nextDomains));


     
    });

    //   effect(() => {
    //     const domains = this.selectedDomains();
    //     const allDomainsArray = this.allDomains();
    //     const filters = this.filtersToApply();

    //     // const currentArray = this.groupByTypes().group_by ?? [];

    //     if (!allDomainsArray?.length) return;

    //     if (allDomainsArray && domains.length < allDomainsArray.length) {
    //       this.allFilters.set(
    //         filters.concat(
    //           `,primary_topic.domain.id:!${this.unselectedDomains()}`
    //         )
    //       );
    //     } else {
    //       this.allFilters.set(filters);
    //     }
    //     console.log('ALL FILTERS AU SELECTED DOMAINS', this.allFilters());
    //     const countFiltered =
    //       this.groupByTypeFilterByDomainsResource.value()?.meta?.count ??
    //       this.countWorks();
    //     this.countWorks.set(countFiltered);
    //     // const datasTypesFiltered =
    //     //   this.groupByTypeFilterByDomainsResource.value()?.group_by ?? [];
    //     // this.typesArray = this.syncCounts(currentArray, datasTypesFiltered);
    //   });
    //   effect(() => {
    //     const types = this.selectedTypes();
    //     const allTypes = this.allTypes();
    //     const filters = this.filtersToApply();

    //     if (!allTypes?.length){ return console.log('YOOOOOOOOOOOOOOOOOOO');}

    //     if (types.length < allTypes.length) {
    //       this.allFilters.set(filters.concat(`,type:!${this.unselectedTypes()}`));
    //     } else {
    //       this.allFilters.set(filters);
    //     }
    //     const count =
    //       this.groupByDomainFilterByTypesResource.value()?.meta?.count ??
    //       this.countWorks();

    //     this.countWorks.set(count);
    //   });
  }
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
  }
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
      return await firstValueFrom(this.api.getKeywordsList(params));
    },
  });

  workResource = resource<OpenAlexWork | undefined, string | undefined>({
    params: () => this.idClicked(),
    loader: async ({ params: id }) => {
      if (!id) return undefined;
      return await firstValueFrom(this.api.getDatasWork(id));
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
      if (!params.sampleWorks || params.sampleWorks === '0') {
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      return await firstValueFrom(
        this.api.getWorksList(params.sampleWorks, params.filters)
      );
    },
  });

  //TODO:Effacer le Meta, puisque je peux récupérer les counts à la création des group_by
  // worksMetaResource = resource<
  //   OpenAlexResponse<OpenAlexWork>,
  //   { search: string | undefined; filters: string; allfilters: string }
  // >({
  //   params: () => ({
  //     search: this.searchSelected(),
  //     filters: this.filtersToApply(),
  //     allfilters: this.allFilters(),
  //   }),
  //   loader: async ({ params }) => {
  //     if (!params.search || params.search === '') {
  //       // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
  //       // Pour éviter les erreurs de type, on peut retourner un objet vide typé
  //       return {} as OpenAlexResponse<OpenAlexWork>;
  //     }
  //     this.pageNumber.set(0);
  //     return await firstValueFrom(
  //       this.api.getMetaWorks(
  //         params.search.toLocaleLowerCase(),
  //         params.allfilters
  //       )
  //     );
  //   },
  // });
  groupByDomainResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { search: string; filters: string }
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

      return await firstValueFrom(
        this.api.getDomainsWorks(params.search, params.filters)
      );
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
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }
      return await firstValueFrom(
        this.api.getTypesWorks(params.search, params.filters)
      );
    },
  });
  groupByTypeFilterByDomainsResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { filters: string }
  >({
    params: () => ({
      filters: this.allFilters(), // 🔥 seule dépendance
    }),

    loader: async ({ params }) => {
      if (!params.filters) {
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }

      return firstValueFrom(
        this.api.getTypesWorks(this.searchSelected(), params.filters)
      );
    },
  });
  groupByDomainFilterByTypesResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { filters: string }
  >({
    params: () => ({
      filters: this.allFilters(), // 🔥 seule dépendance
    }),

    loader: async ({ params }) => {
      if (!params.filters) {
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }

      return firstValueFrom(
        this.api.getDomainsWorks(this.searchSelected(), params.filters)
      );
    },
  });
  // groupByTypeFilterByDomainsResource = resource<
  //   OpenAlexGroupBy<OpenAlexGroupByResult>,
  //   { domains: string[] }
  // >({
  //   params: () => ({
  //     domains: this.selectedDomains(),
  //   }),
  //   loader: async ({ params }) => {
  //     if (!params.domains?.length) {
  //       console.log('Retour vide de groupByTypeFilterByDomainsResource');

  //       return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
  //     }
  //     // const allFilters = this.allFilters();
  //     // const search = this.searchSelected();
  //     // console.log(
  //     //   'groupByTypeFilterByDomainsResource, filters & search:  ',
  //     //   allFilters, search
  //     // );
  //     console.log('groupByTypeFilterByDomainsResource', params.domains);
  //     console.log('allFilters', this.allFilters());
  //     const datas = await firstValueFrom(
  //       this.api.getTypesWorks(this.searchSelected(), this.allFilters())
  //     );
  //     console.log('les datas:  ', datas);
  //     return datas;
  //   },
  // });
  // groupByDomainFilterByTypesResource = resource<
  //   OpenAlexGroupBy<OpenAlexGroupByResult>,
  //   { types: string[] }
  // >({
  //   params: () => ({
  //     types: this.selectedTypes(),
  //   }),
  //   loader: async ({ params }) => {
  //     if (!params.types?.length) {
  //       console.log('Retour vide de groupByDomainFilterByTypesResource');
  //       return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
  //     }
  //     //       const allFilters = this.allFilters();
  //     //  const search = this.searchSelected();
  //     //       console.log(
  //     //         'groupByDomainFilterByTypesResource, filters & search :  ',
  //     //         allFilters, search
  //     //       );
  //     console.log('groupByDomainFilterByTypesResource', params.types);
  //     const datas = await firstValueFrom(
  //       this.api.getDomainsWorks(this.searchSelected(), this.allFilters())
  //     );
  //     return datas;
  //   },
  // });
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
  // getDomainsArray(domains: OpenAlexGroupBy<OpenAlexGroupByResult> | undefined): string[] {
  //  return domains?.group_by?.map(g => g.key) ?? [];
  // }
  // getTypesArray(types: OpenAlexGroupBy<OpenAlexGroupByResult>) {
  //   const keysType = types.group_by.map((g) => g.key);
  //   console.log('getTypesArray', keysType);
  //   return keysType;
  // }
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
  toggleDomain(domain: string, selected: boolean) {
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
  toggleType(type: string, selected: boolean) {
    this.selectedTypes.update((types) => {
      // toggle seulement si l'état actuel est différent de selected
      const isCurrentlySelected = types.includes(type);
      if (isCurrentlySelected === selected) {
        return types; // pas de changement → pas de boucle
      }
      return selected ? [...types, type] : types.filter((d) => d !== type);
    });
  }
  // toggleDomain(domain: string, event: Event) {
  //   event.stopPropagation(); // très important pour éviter que mat-chip-listbox ne traite l'événement comme selectionChange
  //   const current = this.selectedDomains();
  //   this.selectedDomains.set(
  //     current.includes(domain)
  //       ? current.filter((d) => d !== domain)
  //       : [...current, domain]
  //   );
  //   // this.selectedDomains.update(d =>
  //   //   d.includes(domain) ? d.filter(k => k !== domain) : [...d, domain]
  //   // );
  // }
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
  // filtersDomainsToString(domains: string[]) {
  //   const domainsString = domains.map((key) => key.split('/').pop()).join('|');
  //   console.log('domains string:  ', domainsString);
  //   return domainsString;
  // }
  // filtersTypesToString(types: string[]) {
  //   const domainsString = types.map((key) => key.split('/').pop()).join('|');
  //   console.log('domains string:  ', domainsString);
  //   return domainsString;
  // }
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

    const newArray = current.map((item) => ({
      ...item,
      count: nextMap.get(item.key) ?? 0,
    }));
    console.log('Array:  ', current, next);

    console.log('SyncCounts:  ', newArray);
    return newArray;
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
