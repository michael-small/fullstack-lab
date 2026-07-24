import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyCardComponent } from './company-card.component';
import { Company } from '../company-list/company';

describe('CompanyCardComponent', () => {
  let component: CompanyCardComponent;
  let fixture: ComponentFixture<CompanyCardComponent>;
  // The `setInput` for fixtures is unfortunately not typed, but
  // this practice can make things safer. Perhaps it is overkill,
  // or could be worth making a util type
  const requiredInputDefaults: {
    company: ReturnType<typeof fixture.componentInstance.company>;
  } = {
    company: {
      _id: '1',
      count: 0,
      users: [],
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyCardComponent);
    component = fixture.componentInstance;
    // Required inputs must be initialized or else the test fails
    fixture.componentRef.setInput('company', requiredInputDefaults.company);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
