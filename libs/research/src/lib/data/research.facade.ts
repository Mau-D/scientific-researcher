import { Injectable, inject } from '@angular/core';
import { ResearchStore } from './research.store';

@Injectable({ providedIn: 'root' })
export class ResearchFacade {
  private store = inject(ResearchStore);
  readonly keywordsApi = this.store.keywordsResource;
  readonly keywords = this.store.keywords;
readonly keywordsLoading =  this.store.keywordsResource.isLoading;

  readonly search = this.store.search;
  readonly searchSelected = this.store.searchSelected;
readonly searchQuery = this.store.searchQuery;  

  keywordSelection(keyword: string) {
    this.store.keywordSelect(keyword);
  }
  searchKeywords(value: string) {
    this.store.searchKeyword(value);
  }
}
