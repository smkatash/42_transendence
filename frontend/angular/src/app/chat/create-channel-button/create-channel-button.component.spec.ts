import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChannelButtonComponent } from './create-channel-button.component';

describe('CreateChannelButtonComponent', () => {
  let component: CreateChannelButtonComponent;
  let fixture: ComponentFixture<CreateChannelButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateChannelButtonComponent]
    });
    fixture = TestBed.createComponent(CreateChannelButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
