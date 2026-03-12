import { Component, input, output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { OpenAlexGroupByResult } from '@org/models';

@Component({
  selector: 'app-domain-type-filters',
  imports: [MatChipsModule, MatBadgeModule, MatProgressSpinner],
  templateUrl: './domain-type-filters.html',
  styleUrl: './domain-type-filters.scss',
})
export class DomainTypeFilters {
  data = input<OpenAlexGroupByResult[]>([]);
  unselectedList = input<Set<string>>(new Set());
  loading = input<boolean>(false);

  toggleChip = output<OpenAlexGroupByResult>();
  selectedState = input.required<(key: string) => boolean>();
  disabledState = input.required<(data: OpenAlexGroupByResult) => boolean>();

  onToggle(item: OpenAlexGroupByResult) {
    this.toggleChip.emit(item);
  }
}
