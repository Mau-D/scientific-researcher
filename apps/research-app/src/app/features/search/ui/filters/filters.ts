import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ResearchFacade } from '@org/research';

@Component({
  selector: 'app-filters',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './filters.html',
  styleUrl: './filters.scss',
})
export class Filters implements OnInit {
  private formBuilder = inject(FormBuilder);
  private facade = inject(ResearchFacade);

  filtersForm = this.formBuilder.nonNullable.group({
    isOa: true,
    hasAbstract: true,
    hasPdf: true,
    hasOaAcceptedOrPublishedVersion: true,
    language: this.formBuilder.nonNullable.control<string[]>(['fr', 'en']),
  });
  // formSignal = toSignal(this.filtersForm.valueChanges, {
  //   initialValue: this.filtersForm.value,
  // });
  ngOnInit() {
    this.facade.filtersReset.subscribe(() => {
      const filters = this.facade.getCurrentFilters();
      this.filtersForm.setValue(filters, { emitEvent: false });
    });

    this.filtersForm.valueChanges.subscribe((value) => {
      this.facade.filtersChanged(value);
    });
  }
  public resetFormToStore() {
    const filters = this.facade.getCurrentFilters();
    this.filtersForm.setValue(filters, { emitEvent: false });
  }
}
