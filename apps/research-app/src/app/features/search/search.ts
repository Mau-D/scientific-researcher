import {
  Component,
  computed,
  inject,
  OnInit,
  resource,
  signal,
  viewChild
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
export class Search implements OnInit {
  ngOnInit() {
    // écoute toutes les modifications du form
    this.filtersForm.valueChanges.subscribe(() => {
      this.resetDomains();
      this.resetTypes();
      this.pageNumber.set(0);
    });
  }
  //TODO: ajouter un scroll top à chaque nouvelle recherche ou changement des résultats
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
  public idClicked = signal<string>('');
  search = signal('');
  searchSelected = signal('');
  pageNumber = signal(0);
  unselectedDomainsSet = signal<Set<string>>(new Set());
  unselectedTypesSet = signal<Set<string>>(new Set());

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
  countWorks = computed(() => {
    const count =
    this.unselectedDomainsSet().size > 0 || this.unselectedTypesSet().size > 0 ?
      this.groupByDomainsFilteredResource.value()?.meta?.count :
      this.groupByDomainResource.value()?.meta?.count 
    
    console.log('Count works:', count);
    return count;
  });
  domainsDisplayed = computed(() => {
    const unselect = this.unselectedDomainsSet();
    const unselectTypes = this.unselectedTypesSet();
    console.log(
      'Calculating domainsDisplayed with unselectedDomainsSet:',
      unselect
    );
    const domains =
      unselect.size === 0 && unselectTypes.size === 0
        ? this.domainsInitial() ?? []
        : this.newDomainsDisplayed() ?? [];
    console.log('Domains displayed:', domains);
    return domains;
  });
  typesDisplayed = computed(() => {
    const unselect = this.unselectedTypesSet();
    const unselectDomains = this.unselectedDomainsSet();
    console.log(
      'Calculating typesDisplayed with unselectedTypesSet:',
      unselect
    );
    const domains =
      unselect.size === 0 && unselectDomains.size === 0
        ? this.typesInitial() ?? []
        : this.newTypesDisplayed() ?? [];
    console.log('Types displayed:', domains);
    return domains;
  });
  newDomainsDisplayed = computed(() => {
    const unselectedSet = this.unselectedDomainsSet();
    const current = this.domainsInitial();
    const filtered = this.domainsFiltered();

    if (!current || !filtered) return [];

    const filteredMap = new Map(filtered.map((d) => [d.key, d]));

    return current.map((domain) => {
      const key = domain.key;

      const isUnselected = unselectedSet.has(key);
      const filteredDomain = filteredMap.get(key);

      return {
        ...domain,
        count: isUnselected ? 0 : filteredDomain?.count ?? 0,
      };
    });
  });
  newTypesDisplayed = computed(() => {
    const unselectedSet = this.unselectedTypesSet();
    const current = this.typesInitial();
    const filtered = this.typesFiltered();

    if (!current || !filtered) return [];

    const filteredMap = new Map(filtered.map((t) => [t.key, t]));

    return current.map((type) => {
      const key = type.key;

      const isUnselected = unselectedSet.has(key);
      const filteredType = filteredMap.get(key);

      return {
        ...type,
        count: isUnselected ? 0 : filteredType?.count ?? 0,
      };
    });
  });

  domainsInitial = computed(() => {
    const domainsInit = this.groupByDomainResource.value()?.group_by;
    console.log('Domains initial:', domainsInit);
    return domainsInit;
  });
  typesInitial = computed(() => {
    const typesInit = this.groupByTypeResource.value()?.group_by;
    console.log('Types initial:', typesInit);
    return typesInit;
  });
  selectionDomains = computed(() => {
    const unselect = this.unselectedDomainsSet();
    const array = new Set<string>();
    this.domainsDisplayed()?.map((d) => {
      if (!unselect.has(d.key)) {
        array.add(d.key);
      }
    });
    return array;
  });
  selectionTypes = computed(() => {
    const unselect = this.unselectedTypesSet();
    const array = new Set<string>();
    this.typesDisplayed()?.map((t) => {
      if (!unselect.has(t.key)) {
        array.add(t.key);
      }
    });
    return array;
  });
  domainsFiltered = computed(() => {
    const domainsFilt =
      this.groupByDomainsFilteredResource.value()?.group_by ?? [];
    console.log('Domains filtered:', domainsFilt);
    return domainsFilt;
  });
  typesFiltered = computed(() => {
    const typesFilt = this.groupByTypeFilteredResource.value()?.group_by ?? [];
    console.log('Types filtered:', typesFilt);
    return typesFilt;
  });
  //computed for set a new string filters with unselect domainsè
  allFiltersToApply = computed(() => {
    const baseFilters = this.filtersToApply();
    const unselectedDomains = this.unselectedDomainsSet(); // 👈 UNE seule lecture
    const unselectedTypes = this.unselectedTypesSet(); // 👈 UNE seule lecture

    console.log(
      'Calculating allFiltersToApply with unselectedDomainsSet:',
      unselectedDomains,
      'and unselectedTypesSet:',
      unselectedTypes
    );
    const search = this.searchSelected(); // 👈 IMPORTANT

    if (!search || search === '') {
      return '';
    } else if (unselectedDomains.size === 0 && unselectedTypes.size === 0) {
      return baseFilters; // Pas de domaines exclus, on garde les filtres de base
    }

    const unselectedDomainsArray = [...unselectedDomains]
      .map((key) => key.split('/').pop())
      .join('|');
    const unselectedTypesArray = [...unselectedTypes]
      .map((key) => key.split('/').pop())
      .join('|');
    console.log('Unselected Domains Array:', unselectedDomainsArray);
    console.log('Unselected Types Array:', unselectedTypesArray);
    const allFilters = [
      baseFilters,
      unselectedDomainsArray &&
        `primary_topic.domain.id:!${unselectedDomainsArray}`,
      unselectedTypesArray && `type:!${unselectedTypesArray}`,
    ]
      .filter(Boolean)
      .join(',');

    console.log('allFilters:', allFilters);

    return allFilters;
  });
  searchQuery = computed(() => {
    const value = this.search().trim();
    return value.length >= 2 ? value : null;
  });

  keywords = computed(() => {
    return this.keywordsResource.value() ?? [];
  });

  onSelect(event: MatAutocompleteSelectedEvent) {
    const value: string = event.option.value;
    this.searchSelected.set('');

    // 1️⃣ d’abord reset le Set
    this.unselectedDomainsSet.set(new Set());
    this.unselectedTypesSet.set(new Set());
    this.pageNumber.set(0);
    this.search.set(value);
    this.searchSelected.set(value.toLowerCase());
  }
  isDomainSelected(domainKey: string): boolean {
    return !this.unselectedDomainsSet().has(domainKey);
  }
  isTypeSelected(typeKey: string): boolean {
    return !this.unselectedTypesSet().has(typeKey);
  }

  resetDomains() {
    this.unselectedDomainsSet.set(new Set());
  }

  resetTypes() {
    this.unselectedTypesSet.set(new Set());
  }
  lastTypeSelectedWithCount(typeKey: string): boolean {
    //Vérifie que le type est le dernier du tableau ayant un count > 0
    const unselectedSet = this.unselectedTypesSet();
    const displayedTypes = this.typesDisplayed() ?? [];
    const selectedTypesWithCount = displayedTypes.filter(
      (type) => !unselectedSet.has(type.key) && type.count > 0
    );
    if (selectedTypesWithCount.length === 1) {
      return selectedTypesWithCount[0].key === typeKey;
    }
    return false;
  }
  lastDomainSelectedWithCount(domainKey: string): boolean {
    //Vérifie que le domaine est le dernier du tableau ayant un count > 0
    const unselectedSet = this.unselectedDomainsSet();
    const displayedDomains = this.domainsDisplayed() ?? [];
    const selectedDomainsWithCount = displayedDomains.filter(
      (domain) => !unselectedSet.has(domain.key) && domain.count > 0
    );
    if (selectedDomainsWithCount.length === 1) {
      return selectedDomainsWithCount[0].key === domainKey;
    }
    return false;
  }
  toggleDomainSelection(domain: OpenAlexGroupByResult) {
    this.pageNumber.set(0);
    this.unselectedDomainsSet.update((current) => {
      const updated = new Set(current);
      if (updated.has(domain.key)) {
        updated.delete(domain.key);
      } else {
        updated.add(domain.key);
      }
      return updated;
    });
  }
  toggleTypeSelection(type: OpenAlexGroupByResult) {
    this.pageNumber.set(0);
    this.unselectedTypesSet.update((current) => {
      const updated = new Set(current);
      if (updated.has(type.key)) {
        updated.delete(type.key);
      } else {
        updated.add(type.key);
      }
      return updated;
    });
  }

  toggleDrawer() {
    this.drawer()?.toggle();
  }

  onCardClicked(id: string): void {
    this.idClicked.set(id);
    this.toggleDrawer();
  }
  displayWorks(): void {
 
    if (this.searchSelected()) {
      this.pageNumber.set(1);
    }
  }
   closeDrawer() {
    this.drawer()?.close();
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
  groupByDomainsFilteredResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { filters: string }
  >({
    params: () => ({
      filters: this.allFiltersToApply(), // 🔥 seule dépendance
    }),

    loader: async ({ params }) => {
      console.log('groupByDomainsFilters', params.filters);
      if (!params.filters) {
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }

      return firstValueFrom(
        this.api.getDomainsWorks(this.searchSelected(), params.filters)
      );
    },
  });
  groupByTypeFilteredResource = resource<
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
  worksResultResource = resource<
    OpenAlexResponse<OpenAlexWork>,
    { page: number }
  >({
    params: () => ({
      page: this.pageNumber(),
    }),
    loader: async ({ params }) => {
      // Ici, params est ton objet { sample, language }

      const search = this.searchSelected();
      const filters = this.allFiltersToApply();
      const perPage = '25';
      const page = params.page.toString();
      if (!params.page || params.page === 0) {
        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      const worksDatas = await firstValueFrom(
        this.api.getResultWorks(search, perPage, page, filters)
      );
      return worksDatas;
    },
  });

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
