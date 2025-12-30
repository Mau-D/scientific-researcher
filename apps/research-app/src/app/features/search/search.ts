import { Component, inject, signal } from '@angular/core';
import { ResearchCard } from '@org/ui-layout';
import { OpenalexApi } from '@org/research';


@Component({
  selector: 'app-search',
  imports: [ResearchCard],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  private api = inject(OpenalexApi);
  results = signal<any[]>([]);
  search():void{
    this.api.search();
  }
}
