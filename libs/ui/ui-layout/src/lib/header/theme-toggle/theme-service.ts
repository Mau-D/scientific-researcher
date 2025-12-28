import { Injectable } from '@angular/core';
import { Theme } from './theme.model';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  initTheme(): void {

    const storedTheme = localStorage['theme'] as Theme | undefined;

    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    // Déterminer le thème à appliquer
    const appliedTheme: 'light' | 'dark' =
      !storedTheme || storedTheme === 'system'
        ? prefersDark
          ? 'dark'
          : 'light'
        : storedTheme;

    const html = document.documentElement;

    html.setAttribute('data-theme', appliedTheme);
    // Ajouter la classe si le thème est dark (pour toogle slider tailwind)
    if (appliedTheme === 'dark') {
      html.classList.remove('light');
      html.classList.add('dark');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }

  /**
   * Change le thème et le persiste
   * @param theme 'light' | 'dark' | 'system'
   */
  setTheme(theme: Theme): void {
    if (theme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage['theme'] = theme;
    }
    this.initTheme();
  }
}
