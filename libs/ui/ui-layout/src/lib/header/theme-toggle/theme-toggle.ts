import { Component, inject, OnInit, signal } from '@angular/core';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ThemeService } from './theme-service';
import { Theme } from './theme.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-theme-toggle',
  imports: [MatSlideToggleModule, MatIconModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle  implements OnInit{
  private readonly themeService = inject(ThemeService);
  readonly theme = signal<Theme>(
    localStorage['theme'] === 'dark' ? 'dark' : 'light'
  );
   ngOnInit() {
    
    // synchroniser le signal avec le thème actuel appliqué par le service
    const html = document.documentElement;
    this.theme.set(html.classList.contains('dark') ? 'dark' : 'light');
  }
   onToggle(event: MatSlideToggleChange) {
    const newTheme: Theme = event.checked ? 'dark' : 'light';
    this.theme.set(newTheme);
    this.themeService.setTheme(newTheme);
  }
}
