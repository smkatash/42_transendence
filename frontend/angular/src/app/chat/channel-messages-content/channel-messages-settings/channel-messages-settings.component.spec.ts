import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelMessagesSettingsComponent } from './channel-messages-settings.component';

describe('ChannelMessagesSettingsComponent', () => {
  let component: ChannelMessagesSettingsComponent;
  let fixture: ComponentFixture<ChannelMessagesSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelMessagesSettingsComponent]
    });
    fixture = TestBed.createComponent(ChannelMessagesSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
