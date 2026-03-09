import { Component, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { OpenAlexGroupByResult } from '@org/models';
import { OpenalexApi, ResearchFacade } from '@org/research';
import { DomainTypeFilters } from './ui/domain-type-filters/domain-type-filters';
import { Filters } from './ui/filters/filters';
import { Results } from './ui/results/results';
import { SearchInput } from './ui/search-input/search-input';
import { WorkDetails } from './ui/work-details/work-details';

@Component({
  selector: 'app-search',
  imports: [
    SearchInput,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatDrawer,
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
    Filters,
    DomainTypeFilters,
    Results,
    WorkDetails,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  //TODO: ajouter un scroll top à chaque nouvelle recherche ou changement des résultats
  private api = inject(OpenalexApi);
  facade = inject(ResearchFacade);

  drawer = viewChild(MatDrawer);

  readonly searchLoading = this.facade.keywordsLoading;
  readonly search = this.facade.search;
  readonly keywords = this.facade.keywords;
  readonly searchSelected = this.facade.searchSelected;

  readonly countWorks = this.facade.countWorks;
  readonly worksResult = this.facade.worksApi;
  readonly worksLoading = this.facade.worksLoading;
  readonly worksError = this.facade.worksError;

  readonly domainsDisplayed = this.facade.domainsDisplayed;
  readonly unselectedDomains = this.facade.unselectedDomains;
  readonly typesDisplayed = this.facade.typesDisplayed;
  readonly unselectedTypes = this.facade.unselectedTypes;

  readonly idClicked = this.facade.idClicked;
  readonly data = this.facade.workDetails;

  toggleDomain = (domainKey: OpenAlexGroupByResult) => {
    this.facade.toggleDomain(domainKey);
  };
  isDomainSelected() {
    return this.facade.isDomainSelected;
  }
  isDomainDisabled() {
    return this.facade.isDomainDisabled;
  }
  toggleType = (typeKey: OpenAlexGroupByResult) => {
    this.facade.toggleType(typeKey);
  };
  isTypeSelected() {
    return this.facade.isTypeSelected;
  }
  isTypeDisabled() {
    return this.facade.isTypeDisabled;
  }
  onOpenDetails(id: string) {
    this.facade.onClickCard(id);
    this.toggleDrawer();
  }
  onSelect(event: MatAutocompleteSelectedEvent) {
    const value: string = event.option.value;
    this.facade.unselectedDomains.set(new Set());
    this.facade.unselectedTypes.set(new Set());
    this.facade.pageNumber.set(0);
    this.facade.keywordSelection(value);
  }
  researchKeywords(value: string) {
    this.facade.searchKeywords(value);
  }
  toggleDrawer() {
    this.drawer()?.toggle();
  }
  displayWorks(page: number): void {
    if (this.facade.searchSelected()) {
      this.facade.pageNumber.set(page);
    }
  }
  closeDrawer() {
    this.drawer()?.close();
  }
}
