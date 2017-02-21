/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VideocollectionComponent } from './videocollection.component';

describe('VideocollectionComponent', () => {
  let component: VideocollectionComponent;
  let fixture: ComponentFixture<VideocollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideocollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideocollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
