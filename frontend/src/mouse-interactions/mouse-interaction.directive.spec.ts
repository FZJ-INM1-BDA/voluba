import { TestBed } from '@angular/core/testing';
import { MouseInteractionDirective } from './mouse-interaction.directive';
import { ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('MouseInteractionDirective', () => {
  let el: HTMLElement
  beforeEach(() => {
    el = document.createElement('div')
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
      ],
      providers: [
        {
          provide: ElementRef,
          useValue: {
            nativeElement: el
          }
        }
      ]
    })
  })
  it('should create an instance', () => {
    const directive = TestBed.inject(MouseInteractionDirective)
    expect(directive).toBeTruthy();
  });
});
