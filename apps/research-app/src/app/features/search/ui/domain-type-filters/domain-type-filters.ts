import { Component, inject, input, output } from '@angular/core';
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
  unselectedList = input<Set<string>>(new Set());

  toggleChip = output<OpenAlexGroupByResult>();
  selectedState = input.required<(key: string) => boolean>();

  onToggle(item: OpenAlexGroupByResult) {
    this.toggleChip.emit(item);
  }
 
  // isDomainSelected(domainKey: string): boolean {
  //   return this.facade.isDomainSelected(domainKey);
  // }

  // isTypeSelected(domainKey: string): boolean {
  //   return this.facade.isTypeSelected(domainKey);
  // }
}
