import { Route } from '@angular/router';
import { Landing } from '../pages/landing/landing';
import { About } from '../pages/about/about';

export const appRoutes: Route[] = [
  {
    path: '',
    component: Landing,
    data: { title: 'Accueil', showInNavbar: true },
  },
  {
    path: 'about',
    component: About,
    data: { title: 'À propos', showInNavbar: true },
  },
  // {
  //   path: 'settings',
  //   component: SettingsComponent,
  //   data: { title: 'Paramètres', showInNavbar: false },
  // },
];
