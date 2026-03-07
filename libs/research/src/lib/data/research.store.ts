import { Injectable, OnInit, computed, inject, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl } from '@angular/forms';
import { delay, firstValueFrom } from 'rxjs';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import {
  OpenAlexGroupBy,
  OpenAlexGroupByResult,
  OpenAlexResponse,
  OpenAlexWork,
  SearchFilters,
} from '@org/models';
import { OpenalexApi } from '@org/research';
import { filtersToString } from './research.utils';
import { Keyword } from '../../../../../apps/backend/src/app/keywords/entities/keyword.entity';
@Injectable({ providedIn: 'root' })
export class ResearchStore {
  private api = inject(OpenalexApi);
 
  //   public idClicked = signal<string>('');
  search = signal('');
  searchSelected = signal('');
    pageNumber = signal(0);
    unselectedDomainsSet = signal<Set<string>>(new Set());
    unselectedTypesSet = signal<Set<string>>(new Set());
  private filters = signal<SearchFilters>({
    isOa: true,
    hasAbstract: true,
    hasPdf: true,
    hasOaAcceptedOrPublishedVersion: true,
    language: ['fr', 'en'],
  });
  //computed
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
    console.log('Filter To Apply');
    return formFilters;
  });
  filtersString = computed(() => filtersToString(this.filtersToApply()));

    countWorks = computed(() => {
      const count =
        this.unselectedDomainsSet().size > 0 || this.unselectedTypesSet().size > 0
          ? this.groupByDomainsFilteredResource.value()?.meta?.count
          : this.groupByDomainResource.value()?.meta?.count;

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
      const domainsInit = this.groupByDomainResource.value()?.group_by ?? [];
      console.log('Domains initial:', domainsInit);
      return domainsInit;
    });
    typesInitial = computed(() => {
      const typesInit = this.groupByTypeResource.value()?.group_by ?? [];
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
  //   //computed for set a new string filters with unselect domainsè
    allFiltersToApply = computed(() => {
      const baseFilters = this.filtersString();
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

  keywords = computed(() => {
    return this.keywordsResource.value() ?? [];
  });
  //   //resources
  keywordsResource = resource<string[] | null, string | null>({
    params: () => this.searchQuery(),
    loader: async ({ params, abortSignal }) => {
      console.log('Loader keywordsResource called with params:', params);
      if (!params) return null;
      if (params.length < 3) return [];
      // --- LE DEBOUNCE ---
      await delay(300);

      // Si l'utilisateur a retapé une touche, l'abortSignal sera activé
      if (abortSignal.aborted) return [];
      let result = await firstValueFrom(
        this.api.getKeywordsList(params).pipe(delay(300))
      );
      console.log('Keywords fetched:', result);
      return result;
    },
  });

  //   workResource = resource<OpenAlexWork | undefined, string | undefined>({
  //     params: () => this.idClicked(),
  //     loader: async ({ params: id }) => {
  //       if (!id) return undefined;
  //       return await firstValueFrom(this.api.getDatasWork(id));
  //     },
  //   });

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
        filters: this.filtersString(),
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
  //   worksResultResource = resource<
  //     OpenAlexResponse<OpenAlexWork>,
  //     { page: number }
  //   >({
  //     params: () => ({
  //       page: this.pageNumber(),
  //     }),
  //     loader: async ({ params }) => {
  //       // Ici, params est ton objet { sample, language }

  //       const search = this.searchSelected();
  //       const filters = this.allFiltersToApply();
  //       const perPage = '25';
  //       const page = params.page.toString();
  //       if (!params.page || params.page === 0) {
  //         // Note: Le retour doit correspondre au type OpenAlexResponse ou lever une erreur/null
  //         // Pour éviter les erreurs de type, on peut retourner un objet vide typé
  //         return {} as OpenAlexResponse<OpenAlexWork>;
  //       }
  //       const worksDatas = await firstValueFrom(
  //         this.api.getResultWorks(search, perPage, page, filters)
  //       );
  //       return worksDatas;
  //     },
  //   });
  //   //Actions
  //   handleFilterChange() {
  //   this.unselectedDomainsSet.set(new Set());
  //   this.unselectedTypesSet.set(new Set());
  //   this.pageNumber.set(0);
  // }
  searchKeyword(inputString: string) {
    this.search.set(inputString);
    console.log('Search keyword set to:', inputString);
  }
  keywordSelect(keyword: string) {
    // this.searchSelected.set('');

    // 1️⃣ d’abord reset le Set
    // this.unselectedDomainsSet.set(new Set());
    // this.unselectedTypesSet.set(new Set());
    // this.pageNumber.set(0);
    // this.search.set(keyword);
    this.resetFilters();
    this.searchSelected.set(keyword.toLowerCase());
  }
  //TODO: ajuster après fait les domaines et types
  filtersChanged(partial: Partial<SearchFilters>): void {
    // 1. update filters
    this.filters.update((f) => ({ ...f, ...partial }));

    // 2. reset states liés
      this.unselectedDomainsSet.set(new Set());
      this.unselectedTypesSet.set(new Set());

    // 3. reset pagination
      this.pageNumber.set(0);
  }
  //  updateFilters(partial: Partial<SearchFilters>) {
  //     this.filters.update((f) => ({ ...f, ...partial }));
  //   }
  //TODO:Voir si utile, Lors du changement de search
  resetFilters() {
    this.filters.set({
      isOa: true,
      hasAbstract: true,
      hasPdf: true,
      hasOaAcceptedOrPublishedVersion: true,
      language: ['fr', 'en'],
    });
    console.log('Filters reset to default', this.filters());
  }
    isDomainSelected(domainKey: string): boolean {
      return !this.unselectedDomainsSet().has(domainKey);
    }
    isTypeSelected(typeKey: string): boolean {
      return !this.unselectedTypesSet().has(typeKey);
    }
isDomainDisabled(domain:OpenAlexGroupByResult): boolean{
    return  (this.domainsDisplayed().length - this.unselectedDomainsSet().size === 1 && this.isDomainSelected(domain.key))||(this.isDomainSelected(domain.key) && domain.count === 0) || this.lastDomainSelectedWithCount(domain.key)
}
isTypeDisabled(type:OpenAlexGroupByResult): boolean{
    return  (this.typesDisplayed().length - this.unselectedTypesSet().size === 1 && this.isTypeSelected(type.key))||(this.isTypeSelected(type.key) && type.count === 0) || this.lastTypeSelectedWithCount(type.key)
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

  //   displayWorks(): void {
  //     if (this.searchSelected()) {
  //       this.pageNumber.set(1);
  //     }
}
