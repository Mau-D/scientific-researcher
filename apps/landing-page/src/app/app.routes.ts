import { Route } from '@angular/router';
import { Landing } from '../pages/landing/landing';
import { About } from '../pages/about/about';
import { LandingShell } from '../../shell/landing-shell/landing-shell';
export const appRoutes: Route[] = [
  {
    path: '',
    component: LandingShell,
    children: [
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
    ],
  },
];
