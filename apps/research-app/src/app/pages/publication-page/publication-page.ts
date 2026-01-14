import { Component, inject, resource } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs'; // Pour gérer le cas initial
import { OpenAlexWork } from '@org/models';
import { OpenalexApi } from '@org/research';

@Component({
  selector: 'app-publication-page',
  imports: [],
  templateUrl: './publication-page.html',
  styleUrl: './publication-page.scss',
})
export class PublicationPage {
  private api = inject(OpenalexApi);

private route = inject(ActivatedRoute);
  workResource = resource<OpenAlexWork | undefined, string | undefined>({
    params: () => this.route.snapshot.paramMap.get('id') ?? undefined,
    loader: async ({ params: id }) => {
      if (!id) return undefined;
      const datas = await firstValueFrom(this.api.getDatasWork(id));
      // console.log('Fetching work data from OpenAlexApi...', datas.display_name);
      return datas;
    },
  });
}
