import { Component, inject, OnInit } from '@angular/core';
import { Navigation } from '@org/core';
import { NavRoute } from '@org/models';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'lib-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  routes: NavRoute[] = [];
  private nav = inject(Navigation);
  ngOnInit(): void {
    this.routes = this.nav.getNavigationRoutes();
  }
}
