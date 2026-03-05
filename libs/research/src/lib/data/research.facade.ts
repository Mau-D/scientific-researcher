import { Injectable, inject, EventEmitter } from '@angular/core';
import { ResearchStore } from './research.store';
import { SearchFilters, OpenAlexGroupByResult } from '@org/models';

@Injectable({ providedIn: 'root' })
export class ResearchFacade {
  private store = inject(ResearchStore);
  filtersReset = new EventEmitter<void>();

  readonly keywordsApi = this.store.keywordsResource;
  readonly keywords = this.store.keywords;
  readonly keywordsLoading = this.store.keywordsResource.isLoading;

  readonly search = this.store.search;
  readonly searchSelected = this.store.searchSelected;
  readonly searchQuery = this.store.searchQuery;

  readonly filtersString = this.store.filtersString;
  readonly domainsInitial = this.store.domainsInitial;
  readonly typesInitial = this.store.typesInitial;
  readonly unselectedDomains = this.store.unselectedDomainsSet;
  readonly unselectedTypes = this.store.unselectedTypesSet;

  keywordSelection(keyword: string) {
    this.store.keywordSelect(keyword);
    this.filtersReset.emit();
  }
  searchKeywords(value: string) {
    this.store.searchKeyword(value);
  }

  getCurrentFilters(): SearchFilters {
    return this.store.filtersState(); // appelle le signal pour récupérer la valeur actuelle
  }
  filtersChanged(filters: Partial<SearchFilters>) {
    this.store.filtersChanged({ ...filters, language: filters.language ?? [] });
  }
  toggleDomain(domain: OpenAlexGroupByResult) {
    this.store.toggleDomainSelection(domain);
  }
  isDomainSelected = (key: string): boolean => {
    return this.store.isDomainSelected(key);
  };

  isTypeSelected = (key: string): boolean => {
    return this.store.isTypeSelected(key);
  };

  toggleType(type: OpenAlexGroupByResult) {
    this.store.toggleTypeSelection(type);
  }
 
}
