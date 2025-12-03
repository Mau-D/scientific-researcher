import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header, Footer, ThemeService } from '@org/ui-layout';
// import { Footer } from '@org/ui-layout';
// import { ThemeService } from
@Component({
  imports: [RouterModule, Header, Footer],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly themeService = inject(ThemeService);
  protected title = 'landing-page';
  constructor() {
    this.themeService.initTheme();
  }
}
