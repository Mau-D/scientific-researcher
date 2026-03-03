import { Component, EventEmitter, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatAutocompleteModule, MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';

@Component({
  selector: 'app-search-input',
  imports: [MatFormFieldModule, MatAutocompleteModule, MatInput],
  templateUrl: './search-input.html',
  styleUrl: './search-input.scss',
})
export class SearchInput {
loading =  input<boolean>(false);
search =  input<string>('');
suggestions =  input<string[]>([]);

 queryChange = output<string>();
 selectChange = output<MatAutocompleteSelectedEvent>();

 
 }
