import { TestBed } from '@angular/core/testing';

import { OpenalexApi } from './openalex-api';

describe('OpenalexApi', () => {
  let service: OpenalexApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenalexApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
