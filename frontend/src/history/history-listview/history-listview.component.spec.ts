import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryListviewComponent } from './history-listview.component';

describe('HistoryListviewComponent', () => {
  let component: HistoryListviewComponent;
  let fixture: ComponentFixture<HistoryListviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoryListviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryListviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
