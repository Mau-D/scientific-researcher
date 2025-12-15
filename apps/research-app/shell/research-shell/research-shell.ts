import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header, Footer } from '@org/ui-layout';



@Component({
  selector: 'app-research-shell',
  imports: [ RouterModule, Footer, Header],
  templateUrl: './research-shell.html',
  styleUrl: './research-shell.scss',
})
export class ResearchShell {

}
