import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChannelButtonComponent } from './add-channel-button.component';

describe('AddChannelButtonComponent', () => {
  let component: AddChannelButtonComponent;
  let fixture: ComponentFixture<AddChannelButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddChannelButtonComponent]
    });
    fixture = TestBed.createComponent(AddChannelButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
