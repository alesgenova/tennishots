/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TennistatService } from './tennistat.service';

describe('TennistatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TennistatService]
    });
  });

  it('should ...', inject([TennistatService], (service: TennistatService) => {
    expect(service).toBeTruthy();
  }));
});
