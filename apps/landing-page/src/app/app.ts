import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from '@org/ui-layout';
@Component({
  imports: [RouterModule, Header],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'landing-page';
}
