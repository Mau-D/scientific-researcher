import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { ContactFormData } from '../../models/contact-form.model';

@Component({
  selector: 'lib-contact-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDividerModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    title: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // recommandé par la doc
      return;
    }

    const data: ContactFormData = this.form.getRawValue(); // typé ContactFormData
    console.log(data);

    // this.form.reset(); // optionnel
  }
}
