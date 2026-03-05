import { Component, inject, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { ResearchFacade } from '@org/research';
import { OpenAlexGroupByResult } from '@org/models';

@Component({
  selector: 'app-domain-type-filters',
  imports: [MatChipsModule, MatBadgeModule],
  templateUrl: './domain-type-filters.html',
  styleUrl: './domain-type-filters.scss',
})
export class DomainTypeFilters {
  private facade = inject(ResearchFacade);
  data = input<OpenAlexGroupByResult[]>([]);
  unselected = input<Set<string>>(new Set());

  toggleDomainSelection(domain: OpenAlexGroupByResult) {
    this.facade.toggleDomainSelection(domain);
  }
  isDomainSelected(domainKey: string): boolean {
    return this.facade.isDomainSelected(domainKey);
  }
}
