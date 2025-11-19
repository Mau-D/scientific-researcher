import { Component } from '@angular/core';
import { Hero } from "./sections/hero/hero";

@Component({
  selector: 'app-landing',
  imports: [Hero],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {

}
