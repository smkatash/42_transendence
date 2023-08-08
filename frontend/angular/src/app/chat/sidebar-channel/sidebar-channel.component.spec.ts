import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarChannelComponent } from './sidebar-channel.component';

describe('SidebarChannelComponent', () => {
  let component: SidebarChannelComponent;
  let fixture: ComponentFixture<SidebarChannelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarChannelComponent]
    });
    fixture = TestBed.createComponent(SidebarChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
