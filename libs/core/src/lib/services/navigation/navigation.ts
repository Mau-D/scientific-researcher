import { Injectable, inject } from '@angular/core';
import { Router, Route } from '@angular/router';
import { NavRoute } from '@org/models'

@Injectable({
  providedIn: 'root'
})
export class Navigation {
  private router = inject(Router);
  
  getNavigationRoutes(): NavRoute[] {
    return this.router.config
      .map(route => this.mapRoute(route))
      .filter(route => route !== null) as NavRoute[];
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
        .map(child => this.mapRoute(child))
        .filter(child => child !== null) as NavRoute[];

      if (children.length) {
        navRoute.children = children;
      }
    }
    console.log('NavRoute', navRoute);
    
    return navRoute;
  }

}
