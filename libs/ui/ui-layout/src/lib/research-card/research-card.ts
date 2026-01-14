import { Component, input, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { OpenAlexWork } from '@org/models';
import { Button } from '@org/buttons';

@Component({
  selector: 'lib-research-card',
  imports: [MatButtonModule, MatCardModule, MatDividerModule, MatIconModule, Button],
  templateUrl: './research-card.html',
  styleUrl: './research-card.scss',
})
export class ResearchCard {
  data = input.required<OpenAlexWork | undefined>();
  dataResult = computed(() => {
    console.log('Data in ResearchCard:', this.data());
    return this.data();
  });
  dataId = computed(() => {
  const fullId = this.data()?.id; // ex: "https://openalex.org/W2741809807"
  if (!fullId) return undefined;
  
  // Récupère tout ce qui se trouve après le dernier '/'
  return fullId.split('/').pop(); // ex.W2741809807
});
}
