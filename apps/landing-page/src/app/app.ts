import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from '@org/ui-layout';
import { Footer } from '@org/ui-layout';
@Component({
  imports: [RouterModule, Header, Footer],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'landing-page';
}
