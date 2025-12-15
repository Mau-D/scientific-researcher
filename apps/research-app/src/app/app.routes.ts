import { Route } from '@angular/router';
import { ResearchShell } from '../../shell/research-shell/research-shell';
import { SearchPage } from './pages/search-page/search-page';
import { PublicationPage } from './pages/publication-page/publication-page';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ResearchShell,
    children: [
      {
        path: '',
        component: SearchPage,
        data: { title: 'Recherchez', showInNavbar: true },
      },
      {
        path: 'publication:id',
        component: PublicationPage,
        data: { title: 'Publication', showInNavbar: false },
      },
    ],
  },
];
