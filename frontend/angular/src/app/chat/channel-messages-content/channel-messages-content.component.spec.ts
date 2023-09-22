import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelMessagesContentComponent } from './channel-messages-content.component';

describe('ChannelMessagesContentComponent', () => {
  let component: ChannelMessagesContentComponent;
  let fixture: ComponentFixture<ChannelMessagesContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelMessagesContentComponent]
    });
    fixture = TestBed.createComponent(ChannelMessagesContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
