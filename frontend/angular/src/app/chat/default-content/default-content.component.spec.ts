import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultContentComponent } from './default-content.component';

describe('DefaultContentComponent', () => {
  let component: DefaultContentComponent;
  let fixture: ComponentFixture<DefaultContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultContentComponent]
    });
    fixture = TestBed.createComponent(DefaultContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
