import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NehubaViewerWrapperComponent } from './nehuba-viewer-wrapper.component';

describe('NehubaViewerWrapperComponent', () => {
  let component: NehubaViewerWrapperComponent;
  let fixture: ComponentFixture<NehubaViewerWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NehubaViewerWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NehubaViewerWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
