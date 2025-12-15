import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@org/ui-layout';
// import { Footer } from '@org/ui-layout';
// import { ThemeService } from
@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly themeService = inject(ThemeService);
  protected title = 'landing-page';
  constructor() {
    this.themeService.initTheme();
  }
}
