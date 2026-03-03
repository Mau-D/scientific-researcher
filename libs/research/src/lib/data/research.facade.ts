import { Injectable, inject } from '@angular/core';
import { ResearchStore } from './research.store';

@Injectable({ providedIn: 'root' })
export class ResearchFacade {
      private store = inject(ResearchStore);

}