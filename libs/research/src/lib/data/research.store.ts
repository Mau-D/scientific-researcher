import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { delay, firstValueFrom, map } from 'rxjs';

import {
  OpenAlexGroupBy,
  OpenAlexGroupByResult,
  OpenAlexResponse,
  OpenAlexWork,
  SearchFilters,
} from '@org/models';
import { OpenalexApi } from '@org/research';
import { filtersToString } from './research.utils';
@Injectable({ providedIn: 'root' })
export class ResearchStore {
  private api = inject(OpenalexApi);

  public idClicked = signal<string>('');
  search = signal('');
  searchSelected = signal('');
  // pageNumber = signal(1);
  unselectedDomainsSet = signal<Set<string>>(new Set());
  unselectedTypesSet = signal<Set<string>>(new Set());
  private filters = signal<SearchFilters>({
    isOa: true,
    hasAbstract: true,
    hasPdf: true,
    hasOaAcceptedOrPublishedVersion: true,
    language: ['fr', 'en'],
  });
  nextCursor = signal<string | null>(null);
  cursor = signal<string | null>(null);
  perPage = signal<number>(25);
  worksMap = signal(new Map<string, OpenAlexWork>());

  //computed
  works = computed(() => Array.from(this.worksMap().values()));

  searchQuery = computed(() => {
    const value = this.search().trim();
    return value.length >= 2 ? value : null;
  });

  readonly filtersState = computed(() => this.filters());

  filtersToApply = computed(() => {
    const f = this.filters();
    const formFilters = {
      language: f.language?.join('|') || '',
      is_oa: f.isOa,
      has_abstract: f.hasAbstract,
      'has_content.pdf': f.hasPdf,
      has_oa_accepted_or_published_version: f.hasOaAcceptedOrPublishedVersion,
    };
    return formFilters;
  });
  filtersString = computed(() => filtersToString(this.filtersToApply()));

  countWorks = computed(() => {
    const count =
      this.unselectedDomainsSet().size > 0 || this.unselectedTypesSet().size > 0
        ? this.groupByDomainsFilteredResource.value()?.meta?.count
        : this.groupByDomainResource.value()?.meta?.count;
    return count;
  });
  domainsDisplayed = computed(() => {
    const unselect = this.unselectedDomainsSet();
    const unselectTypes = this.unselectedTypesSet();
    const domains =
      unselect.size === 0 && unselectTypes.size === 0
        ? this.domainsInitial() ?? []
        : this.newDomainsDisplayed() ?? [];
    return domains;
  });
  typesDisplayed = computed(() => {
    const unselect = this.unselectedTypesSet();
    const unselectDomains = this.unselectedDomainsSet();
    const domains =
      unselect.size === 0 && unselectDomains.size === 0
        ? this.typesInitial() ?? []
        : this.newTypesDisplayed() ?? [];
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
    const domainsInit = this.groupByDomainResource.value()?.group_by ?? [];
    return domainsInit;
  });
  typesInitial = computed(() => {
    const typesInit = this.groupByTypeResource.value()?.group_by ?? [];
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
    return domainsFilt;
  });
  typesFiltered = computed(() => {
    const typesFilt = this.groupByTypesFilteredResource.value()?.group_by ?? [];
    return typesFilt;
  });
  //   //computed for set a new string filters with unselect domainsè
  allFiltersToApply = computed(() => {
    const baseFilters = this.filtersString();
    const unselectedDomains = this.unselectedDomainsSet(); // 👈 UNE seule lecture
    const unselectedTypes = this.unselectedTypesSet(); // 👈 UNE seule lecture
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
    const allFilters = [
      baseFilters,
      unselectedDomainsArray &&
        `primary_topic.domain.id:!${unselectedDomainsArray}`,
      unselectedTypesArray && `type:!${unselectedTypesArray}`,
    ]
      .filter(Boolean)
      .join(',');
    return allFilters;
  });

  keywords = computed(() => {
    return this.keywordsResource.value() ?? [];
  });
  worksResults = computed(() => {
    return this.worksResultResource.value()?.results ?? [];
  });
  //resources
  keywordsResource = resource<string[] | null, string | null>({
    params: () => this.searchQuery(),
    loader: async ({ params, abortSignal }) => {
      if (!params) return null;
      if (params.length < 3) return [];
      // --- LE DEBOUNCE ---
      await delay(300);

      // Si l'utilisateur a retapé une touche, l'abortSignal sera activé
      if (abortSignal.aborted) return [];
      let result = await firstValueFrom(
        this.api.getKeywordsList(params).pipe(delay(300))
      );
      return result;
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
      filters: this.filtersString(),
    }),
    loader: async ({ params }) => {
      // const filters: string = this.filtersToString(params.filters);
      if (!params.search || params.search === '') {
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
      filters: this.filtersString(),
    }),
    loader: async ({ params }) => {
      if (!params.search || params.search === '') {
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
      if (!params.filters) {
        return {} as OpenAlexGroupBy<OpenAlexGroupByResult>;
      }

      return firstValueFrom(
        this.api.getDomainsWorks(this.searchSelected(), params.filters)
      );
    },
  });
  groupByTypesFilteredResource = resource<
    OpenAlexGroupBy<OpenAlexGroupByResult>,
    { filters: string }
  >({
    params: () => ({
      filters: this.allFiltersToApply(), // 🔥 seule dépendance
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
  worksResultResource = resource<
    OpenAlexResponse<OpenAlexWork>,
    { perPage: number; cursor: string | null }
  >({
    params: () => ({
      perPage: this.perPage(),
      cursor: this.cursor(),
    }),
    loader: async ({ params }) => {
      // Ici, params est ton objet { sample, language }

      const search = this.searchSelected();
      const filters = this.allFiltersToApply();
      const perPage = params.perPage.toString();
      if (!search || !params.cursor) {
        // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
        // Pour éviter les erreurs de type, on peut retourner un objet vide typé
        return {} as OpenAlexResponse<OpenAlexWork>;
      }
      const worksDatas = await firstValueFrom(
        this.api.getResultWorks(search, perPage, filters, params.cursor)
      );
      this.mergeResults(worksDatas);

      return worksDatas;
    },
  });
  searchKeyword(inputString: string) {
    this.search.set(inputString);
  }
  keywordSelect(keyword: string) {
    this.resetFilters();
    this.resetDatas();
    this.searchSelected.set(keyword.toLowerCase());
  }
  //TODO: ajuster après fait les domaines et types
  filtersChanged(partial: Partial<SearchFilters>): void {
    // 1. update filters
    this.filters.update((f) => ({ ...f, ...partial }));
    // 2. reset states liés
    this.unselectedDomainsSet.set(new Set());
    this.unselectedTypesSet.set(new Set());
this.resetDatas();
    this.cursor.set('*');
  }
  //TODO:Voir si utile, Lors du changement de search
  resetFilters() {
    this.filters.set({
      isOa: true,
      hasAbstract: true,
      hasPdf: true,
      hasOaAcceptedOrPublishedVersion: true,
      language: ['fr', 'en'],
    });
  }
  resetDatas(): void {
    this.nextCursor.set(null);
    this.cursor.set(null);
    this.worksMap.set(new Map());
  }
  isDomainSelected(domainKey: string): boolean {
    return !this.unselectedDomainsSet().has(domainKey);
  }
  isTypeSelected(typeKey: string): boolean {
    return !this.unselectedTypesSet().has(typeKey);
  }
  isDomainDisabled(domain: OpenAlexGroupByResult): boolean {
    return (
      (this.domainsDisplayed().length - this.unselectedDomainsSet().size ===
        1 &&
        this.isDomainSelected(domain.key)) ||
      (this.isDomainSelected(domain.key) && domain.count === 0) ||
      this.lastDomainSelectedWithCount(domain.key)
    );
  }
  isTypeDisabled(type: OpenAlexGroupByResult): boolean {
    return (
      (this.typesDisplayed().length - this.unselectedTypesSet().size === 1 &&
        this.isTypeSelected(type.key)) ||
      (this.isTypeSelected(type.key) && type.count === 0) ||
      this.lastTypeSelectedWithCount(type.key)
    );
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
    // this.pageNumber.set(0);
   this.resetDatas();
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
    this.resetDatas();
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
  displayWorks(): void {
    // reset complet
    this.resetDatas();
    // déclenche API
    this.cursor.set('*');
  }
  loadMore(): void {
    const next = this.nextCursor();

    if (!next) return;

    this.cursor.set(next);
  }

  mergeResults(response: OpenAlexResponse<OpenAlexWork>): void {
    this.nextCursor.set(response.meta?.next_cursor ?? null);

    const map = new Map(this.worksMap());

    for (const work of response.results ?? []) {
      map.set(work.id, work);
    }

    this.worksMap.set(map);
  }
  onClickCard(id: string) {
    this.idClicked.set(id);
  }
}
