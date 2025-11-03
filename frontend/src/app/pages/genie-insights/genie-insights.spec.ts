import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenieInsights } from './genie-insights';

describe('GenieInsights', () => {
  let component: GenieInsights;
  let fixture: ComponentFixture<GenieInsights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenieInsights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenieInsights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
