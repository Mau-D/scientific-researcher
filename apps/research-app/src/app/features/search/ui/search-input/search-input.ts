import { Component, input, output } from '@angular/core';
import {
  MatAutocompleteModule, MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

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
