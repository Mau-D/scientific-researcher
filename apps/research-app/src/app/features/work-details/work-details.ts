import { DatePipe, PercentPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Button } from '@org/buttons';
import {
  OA_STATUS_DETAILS,
  OaStatus,
  OpenAlexWork,
  Concept,
} from '@org/models';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-work-details',
  imports: [
    DatePipe,
    PercentPipe,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    Button,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './work-details.html',
  styleUrl: './work-details.scss',
})
export class WorkDetails {
  readonly data = input.required<OpenAlexWork | undefined>();
  readonly sortedConcepts = computed(() => {
                console.log('lenght awards', this.data()?.awards)

    const concepts: Concept[] = this.data()?.concepts || [];

    return [...concepts.filter((concept) => concept.score >= 0.3)]    //On retire les éléments avec une confiance < 30%
      .sort((a, b) => {
        // 1. Priorité au niveau le plus élevé (ex: Level 3 avant Level 0)
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        // 2. Si même niveau, on prend le score le plus haut
        return b.score - a.score;
      })
      .slice(0, 10)
      
    // On limite aux 10 plus pertinents
  });
  dataId = computed(() => {

    const fullId = this.data()?.id; // ex: "https://openalex.org/W2741809807"
    if (!fullId) return undefined;

    // Récupère tout ce qui se trouve après le dernier '/'
    return fullId.split('/').pop(); // ex.W2741809807
  });
  // On récupère les infos associées au status
  // On crée un Signal dérivé (computed)
  readonly oaDetails = computed(() => {
    const status = this.data()?.open_access?.oa_status as OaStatus;

    // Sécurité : si data est undefined ou le statut inconnu
    if (!status || !OA_STATUS_DETAILS[status]) return null;

    return OA_STATUS_DETAILS[status];
  });
  //Extrait de la publication
  readonly abstract = computed(() => {
    const work = this.data();
    const index = work?.abstract_inverted_index;

    if (!index) return null;

    // --- ÉTAPE 1 : Trouver la taille du tableau  ---
    // On récupère juste les listes de chiffres, on les met à plat, et on cherche le max.
    const allPositions = Object.values(index).flat();
    const maxIndex = Math.max(...allPositions);

    // --- ÉTAPE 2 : Préparer le tableau vide ---
    const result = new Array(maxIndex + 1);

    // --- ÉTAPE 3 : Remplir le puzzle (On garde cette boucle !) ---
    // Ici, on a BESOIN du mot (word) et des positions.
    // Comme on utilise "word" ici, ESLint ne râlera pas.
    for (const [word, positions] of Object.entries(index)) {
      for (const pos of positions) {
        result[pos] = word;
      }
    }
    return result.join(' ');
  });
  getLevelColor(level: number): string {
    const colors: Record<number, string> = {
      0: 'rgb(0, 90, 242, 0.2)', // Gris (Général)
      1: 'rgb(0, 90, 242, 0.2)', // Bleu
      2: 'rgb(0, 90, 242, 0.2)', // Violet
      3: 'rgba(42, 186, 221, 0.2)', // Rose
      4: 'rgba(42, 186, 221, 0.2)', // Rouge
      5: 'rgba(42, 186, 221, 0.2)', // Vert (Ultra précis)
    };
    return colors[level] || colors[0];
  }
}
