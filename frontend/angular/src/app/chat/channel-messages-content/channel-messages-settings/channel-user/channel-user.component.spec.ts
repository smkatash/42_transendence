import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelUserComponent } from './channel-user.component';

describe('ChannelUserComponent', () => {
  let component: ChannelUserComponent;
  let fixture: ComponentFixture<ChannelUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelUserComponent]
    });
    fixture = TestBed.createComponent(ChannelUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
