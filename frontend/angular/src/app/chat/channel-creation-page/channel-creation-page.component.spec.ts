import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelCreationPageComponent } from './channel-creation-page.component';

describe('ChannelCreationPageComponent', () => {
  let component: ChannelCreationPageComponent;
  let fixture: ComponentFixture<ChannelCreationPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelCreationPageComponent]
    });
    fixture = TestBed.createComponent(ChannelCreationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
