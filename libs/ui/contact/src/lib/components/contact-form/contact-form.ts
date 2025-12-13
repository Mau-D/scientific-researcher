import { Component, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';
import { ContactFormData } from '../../models/contact-form.model';

@Component({
  selector: 'lib-contact-form',
  imports: [FormsModule, MatFormFieldModule,MatInputModule,MatDividerModule ],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm  {
 contact: ContactFormData = {
    name: '',
    email: '',
    message: ''
  };
  form = viewChild<NgForm>('videoGameForm');
  save(): void {
    console.log(this.form()?.valid);
    console.log(this.form()?.controls['name'].errors);
  }
}
