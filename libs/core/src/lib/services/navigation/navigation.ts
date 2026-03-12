import { Injectable, inject } from '@angular/core';
import { Router, Route } from '@angular/router';
import { NavRoute } from '@org/models';

@Injectable({
  providedIn: 'root',
})
export class Navigation {
  private router = inject(Router);

  getNavigationRoutes(): NavRoute[] {
    const topRoutes = this.router.config;
    const navRoutes: NavRoute[] = [];

    topRoutes.forEach((route) => {
      if (route.children) {
        route.children.forEach((child) => {
          const mapped = this.mapRoute(child);
          if (mapped) {
            navRoutes.push(mapped);
          }
        });
      } else {
        const mapped = this.mapRoute(route);
        if (mapped) navRoutes.push(mapped);
      }
    });
    return navRoutes;
  }
  private mapRoute(route: Route): NavRoute | null {
    if (!route.data?.['showInNavbar']) {
      return null;
    }

    const navRoute: NavRoute = {
      path: route.path || '',
      title: route.data['title'] || '',
      children: [],
    };

    if (route.children && route.children.length > 0) {
      const children = route.children
        .map((child) => this.mapRoute(child))
        .filter((child) => child !== null) as NavRoute[];

      if (children.length) {
        navRoute.children = children;
      }
    }
    return navRoute;
  }
}
