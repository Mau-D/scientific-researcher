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
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
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
import { delay, firstValueFrom } from 'rxjs'; // Pour gérer le cas initial
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
  // currentWork: OpenAlexWork | undefined;
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
  formSignal = toSignal(this.filtersForm.valueChanges, {
    initialValue: this.filtersForm.value,
  });
  search = signal('');
  searchSelected = signal('');
  pageNumber = signal(0);

  manualSelectedDomains = signal<string[] | null>(null);
  // unselectedDomains = signal<string>('');
  manualSelectedTypes = signal<string[] | null>(null);
  // unselectedTypes = signal<string>('');
  public idClicked = signal<string>('');
  sampleWorks = signal<string | undefined>(undefined);

  allFilters = signal<string>('');

  countWorks = computed(
    () =>
      this.groupByTypeFilterByDomainsResource.value()?.meta?.count ??
      this.groupByDomainFilterByTypesResource.value()?.meta?.count ??
      this.groupByDomainResource.value()?.meta?.count ??
      0
  );
  filtersToApply = computed(() => {
    const formFilters = {
      language: this.formSignal().language?.join('|') || '',
      is_oa: this.formSignal().isOa,
      has_abstract: this.formSignal().hasAbstract,
      'has_content.pdf': this.formSignal().hasPdf,
      has_oa_accepted_or_published_version:
        this.formSignal().hasOaAcceptedOrPublishedVersion,
    };
    console.log('Filter To Apply');
    return this.filtersToString(formFilters);
  });
  searchQuery = computed(() => {
    const value = this.search().trim();
    return value.length >= 2 ? value : null;
  });

  keywords = computed(() => {
    return this.keywordsResource.value() ?? [];
  });

  domainsFromBackend = computed(
    () => this.groupByDomainResource.value()?.group_by ?? []
  );
  domainsFilteredBackend = computed(
    () => this.groupByDomainFilterByTypesResource.value()?.group_by ?? []
  );
  selectedDomains = computed(
    () =>
      this.manualSelectedDomains() ??
      this.domainsFromBackend()?.map((d) => d.key)
  );
  selectedDomainsSet = computed(() => new Set(this.selectedDomains()));
  unselectedDomains = computed(() => {
    const selected = this.selectedDomainsSet();
    console.log('unselectedDomains computation');
    return this.domainsFromBackend()
      .map((d) => d.key)
      .filter((d) => !selected.has(d))
      .map((d) => d.split('/').pop())
      .join('|');
  });
  domainsArray = computed(() =>
    this.syncCounts(
      this.domainsFromBackend() ?? [],
      this.domainsFilteredBackend() ?? this.domainsFromBackend() ?? []
    )
  );

  // allTypes = computed(
  //   () => this.groupByTypeResource.value()?.group_by?.map((g) => g.key) ?? []
  // );
  typesFromBackend = computed(
    () => this.groupByTypeResource.value()?.group_by ?? []
  );
  selectedTypes = computed(
    () =>
      this.manualSelectedTypes() ?? this.typesFromBackend().map((t) => t.key)
  );
  selectedTypesSet = computed(() => new Set(this.selectedTypes()));
  unselectedTypes = computed(() => {
    const selected = this.selectedTypesSet();

    return this.typesFromBackend()
      .map((t) => t.key)
      .filter((t) => !selected.has(t))
      .map((t) => t.split('/').pop())
      .join('|');
  });
  typesFilteredBackend = computed(
    () => this.groupByTypeFilterByDomainsResource.value()?.group_by ?? []
  );
  typesArray = computed(() =>
    this.syncCounts(
      this.typesFromBackend(),
      this.typesFilteredBackend() ?? this.typesFromBackend() ?? []
    )
  );
  allFiltersToApply = computed(() => {
    console.log('allFiltersToApply');
    const baseFilters = this.filtersToApply();
    if (!this.unselectedDomains() && !this.unselectedTypes()) {
      return '';
    }
    const allFilters = [
      baseFilters,
      this.unselectedDomains() &&
        `primary_topic.domain.id:!${this.unselectedDomains()}`,
      this.unselectedTypes() && `type:!${this.unselectedTypes()}`,
    ]
      .filter(Boolean)
      .join(',');
    console.log('allFilters:', allFilters);
    return allFilters;
    // this.allFilters.set(allFilters);
  });
  constructor() {
    // effect(() => {
    //   const domains = this.allDomains();
    //   const types = this.allTypes();
    //   untracked(() => {
    //     this.selectedDomains.set(domains);
    //     this.selectedTypes.set(types);
    //     // this.unselectedDomains.set('');
    //     // this.unselectedTypes.set('');
    //   });
    // });
  }
  onSelect(event: MatAutocompleteSelectedEvent) {
    const value: string = event.option.value;

    this.searchSelected.set(value);
    this.manualSelectedDomains.set(null);
    this.manualSelectedTypes.set(null);
  }

  toggleDrawer() {
    this.drawer()?.toggle();
  }

  onCardClicked(id: string): void {
    this.idClicked.set(id);
    this.toggleDrawer();
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
    loader: async ({ params, abortSignal }) => {
      if (!params) return null;
      if (params.length < 3) return [];
      // --- LE DEBOUNCE ---
      await delay(300);

      // Si l'utilisateur a retapé une touche, l'abortSignal sera activé
      if (abortSignal.aborted) return [];
      // const response = await fetch(`/api/keywords?q=${params}`, { signal: abortSignal });
      return await firstValueFrom(
        this.api.getKeywordsList(params).pipe(delay(300))
      );
    },
  });

  workResource = resource<OpenAlexWork | undefined, string | undefined>({
    params: () => this.idClicked(),
    loader: async ({ params: id }) => {
      if (!id) return undefined;
      return await firstValueFrom(this.api.getDatasWork(id));
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
      filters: this.allFiltersToApply(), // 🔥 seule dépendance
    }),

    loader: async ({ params }) => {
      console.log('groupByTypeFilters', params.filters);
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
      filters: this.allFiltersToApply(), // 🔥 seule dépendance
    }),

    loader: async ({ params }) => {
      console.log('groupByDomainFilters', params.filters);

      if (!params.filters) {
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }

      return firstValueFrom(
        this.api.getDomainsWorks(this.searchSelected(), params.filters)
      );
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
          this.allFilters()
        )
      );
      return worksDatas;
    },
  });

  // toggleDomain(domain: string, selected: boolean) {
  //   console.log('TOGGLE DOMAIN');

  //   this.selectedDomains.update((domains) => {
  //     // toggle seulement si l'état actuel est différent de selected
  //     const isCurrentlySelected = domains.includes(domain);
  //     if (isCurrentlySelected === selected) {
  //       return domains; // pas de changement → pas de boucle
  //     }
  //     return selected
  //       ? [...domains, domain]
  //       : domains.filter((d) => d !== domain);
  //   });
  //   console.log('selectDomains', this.selectedDomains());
  //   const unselect = this.allDomains()
  //     .filter((d) => !this.selectedDomains().includes(d))
  //     .map((d) => d.split('/').pop())
  //     .join('|');
  //   this.unselectedDomains.set(unselect);
  //   // this.allFiltersToApply();
  //   console.log('unselected domains: ', this.unselectedDomains());
  // }
  toggleDomain(domain: string, selected: boolean) {
    console.log('TOGGLE DOMAIN');
    console.log('Domain to toggle: ', domain, 'Selected: ', selected);
    console.log(
      'Current selected domains before toggle: ',
      this.selectedDomains()
    );
    console.log(
      'Current manualSelectedDomains before toggle: ',
      this.manualSelectedDomains()
    );
    console.log(
      'Domains from backend: ',
      this.domainsFromBackend().map((d) => d.key)
    );
    console.log('unselectedDomains before toggle: ', this.unselectedDomains());
    console.log('allFilters before toggle: ', this.allFilters());
    this.manualSelectedDomains.update((current) => {
      const base = current ?? this.domainsFromBackend().map((t) => t.key);
      const set = new Set(base);

      if (selected) {
        set.add(domain);
      } else {
        set.delete(domain);
      }
      return [...set];
    });
  }
  // toggleType(type: string, selected: boolean) {
  //   console.log('TOGGLE TYPE');

  //   this.selectedTypes.update((types) => {
  //     // toggle seulement si l'état actuel est différent de selected
  //     const isCurrentlySelected = types.includes(type);
  //     if (isCurrentlySelected === selected) {
  //       return types; // pas de changement → pas de boucle
  //     }
  //     return selected ? [...types, type] : types.filter((d) => d !== type);
  //   });
  //   const unselect = this.allTypes()
  //     .filter((d) => !this.selectedTypes().includes(d))
  //     .map((d) => d.split('/').pop())
  //     .join('|');
  //   this.unselectedTypes.set(unselect);

  //   // this.allFiltersToApply();
  // }
  toggleType(type: string, selected: boolean) {
    console.log('TOGGLE TYPE');
    this.manualSelectedTypes.update((current) => {
      const base = current ?? this.typesFromBackend().map((t) => t.key);
      const set = new Set(base);

      if (selected) {
        set.add(type);
      } else {
        set.delete(type);
      }
      return [...set];
    });
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
  // allFiltersToApply() {
  //   console.log('allFiltersToApply');
  //   const baseFilters = this.filtersToApply();

  //   const allFilters = [
  //     baseFilters,
  //     this.unselectedDomains() &&
  //       `primary_topic.domain.id:!${this.unselectedDomains()}`,
  //     this.unselectedTypes() && `type:!${this.unselectedTypes()}`,
  //   ]
  //     .filter(Boolean)
  //     .join(',');

  //   this.allFilters.set(allFilters);
  //   console.log(this.allFilters());
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
    return !next.length ? current : newArray;
  }
  // Getters pour simplifier l'accès dans le template
  //   .value() : La dernière valeur reçue avec succès (Signal).
  // .isLoading() : true si une requête est en cours (Signal).
  // .error() : Contient l'objet d'erreur si la requête échoue (Signal).
  // .status() : L'état précis (Idle, Loading, Resolved, Error).
  // .reload() : Une méthode pour forcer manuellement le rafraîchissement.

  // Alias pour le template
  workData = this.worksResultResource.value;
  isLoading = this.worksResultResource.isLoading;
  error = this.worksResultResource.error;
}
