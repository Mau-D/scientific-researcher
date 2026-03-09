import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '@org/buttons';
import { OpenAlexWork } from '@org/models';
@Component({
  selector: 'app-card-work',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    Button,
    DatePipe,
  ],
  templateUrl: './card-work.html',
  styleUrl: './card-work.scss',
})
export class CardWork {
  readonly clickedForDetails = output<string>();
  readonly data = input.required<OpenAlexWork | undefined>();

  // dataResult = computed(() => {
  //   console.log('Data in ResearchCard:', this.data());
  //   return this.data();
  // });
  dataId = computed(() => {
    const fullId = this.data()?.id; // ex: "https://openalex.org/W2741809807"
    if (!fullId) return undefined;

    // Récupère tout ce qui se trouve après le dernier '/'
    return fullId.split('/').pop(); // ex.W2741809807
  });
  onClickForDetails() {
    const id: string | undefined = this.dataId();
    this.clickedForDetails.emit(id || '');
    console.log('research-card', id);
  }
}
