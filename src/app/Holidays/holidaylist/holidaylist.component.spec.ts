import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaylistComponent } from './holidaylist.component';

describe('HolidaylistComponent', () => {
  let component: HolidaylistComponent;
  let fixture: ComponentFixture<HolidaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidaylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
