import { TestBed } from '@angular/core/testing';

import { Patrimony } from './patrimony.service';

describe('Patrimony', () => {
  let service: Patrimony;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Patrimony);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
