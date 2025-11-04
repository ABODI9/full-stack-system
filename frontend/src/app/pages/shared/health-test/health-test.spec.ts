import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthTest } from './health-test';

describe('HealthTest', () => {
  let component: HealthTest;
  let fixture: ComponentFixture<HealthTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
