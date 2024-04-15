import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovablePortalComponent } from './movable-portal.component';

describe('MovablePortalComponent', () => {
  let component: MovablePortalComponent;
  let fixture: ComponentFixture<MovablePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MovablePortalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MovablePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
