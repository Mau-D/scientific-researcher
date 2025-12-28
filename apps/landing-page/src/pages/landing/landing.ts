import { Component } from '@angular/core';
import { Hero } from "./sections/hero/hero";
import { AboutSection } from './sections/about-section/about-section';
import { Pricing } from "./sections/pricing/pricing";
import { ResearchCta } from './sections/research-cta/research-cta';

@Component({
  selector: 'app-landing',
  imports: [Hero, AboutSection, Pricing, ResearchCta
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {

}
