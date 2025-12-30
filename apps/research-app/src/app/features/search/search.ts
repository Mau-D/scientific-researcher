import { Component, inject, effect } from '@angular/core';
import { ResearchCard } from '@org/ui-layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import { OpenalexApi } from '@org/research';

@Component({
  selector: 'app-search',
  imports: [ResearchCard],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  private api = inject(OpenalexApi);
  // // 1. Un Subject pour émettre un événement à chaque clic
  // private click$ = new Subject<void>();

  // // 2. On transforme le flux de clics en flux de données, puis en Signal
  // // switchMap garantit qu'on appelle l'API à chaque clic
  // data = toSignal(this.click$.pipe(switchMap(() => this.api.search())));
  // constructor() {
  //   // 3. Effet pour logger le résultat dans la console dès que 'data' change
  //   effect(() => {
  //     const currentVal = this.data();
  //     if (currentVal) {
  //       console.log('Bouton cliqué, message reçu :', currentVal.message);
  //     }
  //   });
  // }
  search() {
    this.api.search();
    // this.click$.next();
  }
}
