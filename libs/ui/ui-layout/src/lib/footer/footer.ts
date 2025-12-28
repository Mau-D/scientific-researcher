import { Component } from '@angular/core';
import { ContactForm } from '@org/contact'

@Component({
  selector: 'lib-footer',
  imports: [ContactForm],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

}
