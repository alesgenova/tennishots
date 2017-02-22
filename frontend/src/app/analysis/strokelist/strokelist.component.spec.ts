/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StrokelistComponent } from './strokelist.component';

describe('StrokelistComponent', () => {
  let component: StrokelistComponent;
  let fixture: ComponentFixture<StrokelistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrokelistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrokelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
