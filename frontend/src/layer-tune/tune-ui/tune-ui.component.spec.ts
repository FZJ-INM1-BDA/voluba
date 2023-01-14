import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuneUiComponent } from './tune-ui.component';

describe('TuneUiComponent', () => {
  let component: TuneUiComponent;
  let fixture: ComponentFixture<TuneUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TuneUiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TuneUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
