import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header, Footer } from '@org/ui-layout';

@Component({
  selector: 'app-landing-shell',
  imports: [Header, Footer, RouterModule],
  templateUrl: './landing-shell.html',
  styleUrl: './landing-shell.scss',
})
export class LandingShell {

}
