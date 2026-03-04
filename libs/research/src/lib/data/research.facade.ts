import { Injectable, inject, EventEmitter } from '@angular/core';
import { ResearchStore } from './research.store';
import { SearchFilters } from '@org/models';

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
}
