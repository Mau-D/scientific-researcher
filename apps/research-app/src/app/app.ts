import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@org/ui-layout';



@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'research-app';
    private readonly themeService = inject(ThemeService);

  constructor() {
    this.themeService.initTheme();
  }
}
