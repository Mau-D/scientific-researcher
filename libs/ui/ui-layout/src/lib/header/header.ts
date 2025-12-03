import { Component, inject, OnInit } from '@angular/core';
import { Navigation } from '@org/core';
import { NavRoute } from '@org/models';
import { RouterModule } from '@angular/router';
import { LoginButton } from '@org/buttons';
import { ThemeToggle } from './theme-toggle/theme-toggle'
@Component({
  selector: 'lib-header',
  imports: [RouterModule, LoginButton, ThemeToggle],
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
