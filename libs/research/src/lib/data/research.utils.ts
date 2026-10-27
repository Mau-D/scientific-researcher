import { OpenAlexFilters } from '@org/models';

export function filtersToString(filters: OpenAlexFilters): string {
  return Object.entries(filters)
    .filter(([_, v]) => v !== false && v !== '')
    .map(([k, v]) => `${k}:${v}`)
    .join(',');
}
