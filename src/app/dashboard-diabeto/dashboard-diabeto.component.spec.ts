import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDiabetoComponent } from './dashboard-diabeto.component';

describe('DashboardDiabetoComponent', () => {
  let component: DashboardDiabetoComponent;
  let fixture: ComponentFixture<DashboardDiabetoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardDiabetoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDiabetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
