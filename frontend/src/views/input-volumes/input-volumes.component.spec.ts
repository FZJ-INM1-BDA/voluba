import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputVolumesComponent } from './input-volumes.component';

describe('InputVolumesComponent', () => {
  let component: InputVolumesComponent;
  let fixture: ComponentFixture<InputVolumesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputVolumesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputVolumesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
