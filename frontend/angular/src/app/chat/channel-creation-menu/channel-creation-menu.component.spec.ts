import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelCreationMenuComponent } from './channel-creation-menu.component';

describe('ChannelCreationMenuComponent', () => {
  let component: ChannelCreationMenuComponent;
  let fixture: ComponentFixture<ChannelCreationMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelCreationMenuComponent]
    });
    fixture = TestBed.createComponent(ChannelCreationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
