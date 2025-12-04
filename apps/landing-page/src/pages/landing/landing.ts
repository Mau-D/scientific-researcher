import { Component } from '@angular/core';
import { Hero } from "./sections/hero/hero";
import { AboutSection } from './sections/about-section/about-section';

@Component({
  selector: 'app-landing',
  imports: [Hero, AboutSection],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {

}
