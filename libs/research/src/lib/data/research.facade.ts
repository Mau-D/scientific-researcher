import { Injectable, inject, EventEmitter } from '@angular/core';
import { ResearchStore } from './research.store';
import { SearchFilters, OpenAlexGroupByResult } from '@org/models';

@Injectable({ providedIn: 'root' })
export class ResearchFacade {
  private store = inject(ResearchStore);
  filtersReset = new EventEmitter<void>();

  readonly pageNumber = this.store.pageNumber;
  readonly countWorks = this.store.countWorks;

  readonly keywordsApi = this.store.keywordsResource;
  readonly keywords = this.store.keywords;
  readonly keywordsLoading = this.store.keywordsResource.isLoading;

  readonly search = this.store.search;
  readonly searchSelected = this.store.searchSelected;
  readonly searchQuery = this.store.searchQuery;

  readonly allFiltersToApply = this.store.allFiltersToApply;
  readonly filtersString = this.store.filtersString;
  readonly domainsInitial = this.store.domainsInitial;
  readonly domainsLoading = this.store.groupByDomainsFilteredResource.isLoading;
  readonly domainsDisplayed = this.store.domainsDisplayed;
  readonly typesInitial = this.store.typesInitial;
  readonly typesLoading = this.store.groupByTypesFilteredResource.isLoading;

  readonly typesDisplayed = this.store.typesDisplayed;
  readonly unselectedDomains = this.store.unselectedDomainsSet;
  readonly unselectedTypes = this.store.unselectedTypesSet;

  readonly worksApi = this.store.worksResultResource;
  readonly worksResults = this.store.worksResults;
  readonly worksLoading = this.worksApi.isLoading;
  readonly worksError = this.worksApi.error;
  readonly idClicked = this.store.idClicked;
  readonly workDetails = this.store.workResource;
  onClickCard(id: string) {
    this.store.onClickCard(id);
  }
  keywordSelection(keyword: string) {
    this.store.keywordSelect(keyword);
    this.filtersReset.emit();
  }
  searchKeywords(value: string) {
    this.store.searchKeyword(value);
  }
  displayWorks(page: number) {
    this.store.displayWorks(page);
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
  toggleType(type: OpenAlexGroupByResult) {
    this.store.toggleTypeSelection(type);
  }
  isDomainSelected = (key: string): boolean => {
    return this.store.isDomainSelected(key);
  };

  isTypeSelected = (key: string): boolean => {
    return this.store.isTypeSelected(key);
  };
  isDomainDisabled = (domain: OpenAlexGroupByResult): boolean => {
    return this.store.isDomainDisabled(domain);
  };
  isTypeDisabled = (type: OpenAlexGroupByResult): boolean => {
    return this.store.isTypeDisabled(type);
  };
}
