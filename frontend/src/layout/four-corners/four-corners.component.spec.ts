import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FourCornersComponent } from './four-corners.component';

describe('FourCornersComponent', () => {
  let component: FourCornersComponent;
  let fixture: ComponentFixture<FourCornersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FourCornersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FourCornersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
