import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataEntry } from './data-entry';

describe('DataEntry', () => {
  let component: DataEntry;
  let fixture: ComponentFixture<DataEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
