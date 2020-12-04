import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy, TemplateRef, QueryList, ViewChildren } from '@angular/core';

import { Patient } from '../patients-service/profile-classes';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as moment from 'moment';

import { ActivatedRoute, Router } from '@angular/router';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

// Notes imports

import {
  CdkDrag,
  CdkDragStart,
  CdkDropList, CdkDropListGroup, CdkDragMove, CdkDragEnter,
  moveItemInArray, DragDropModule
} from "@angular/cdk/drag-drop";
import {ViewportRuler} from "@angular/cdk/overlay";

// Planning imports

import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';

import { DomSanitizer } from '@angular/platform-browser';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

moment.locale('fr')


@Component({
  selector: 'app-confirm-deletion',
  templateUrl: 'confirm-deletion.html',
  styleUrls: ['./dashboard.component.css']
})
export class ConfirmDeletionComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmDeletionComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

export interface MeasureData {
  measure: number;
  time: Date;
}

@Component({
  selector: 'app-add-measure',
  templateUrl: 'add-measure.html',
  styleUrls: ['./dashboard.component.css']
})
export class AddMeasureComponent {

  constructor(public dialogRef: MatDialogRef<AddMeasureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MeasureData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

export interface NoteData {
  color: any;
  note: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-add-note',
  templateUrl: 'add-note.html',
  styleUrls: ['./dashboard.component.css']
})
export class AddNoteComponent {

  public noteColors = [
    {
      name: "bleu",
      code: "#01B5EA"
    },
    {
      name: "orange",
      code: "#FFA300"
    },
    {
      name: "rouge",
      code: "#E23600"
    },
    {
      name: "marron",
      code: "#872C2C"
    },
    {
      name: "vert",
      code: "#49B20D"
    },
    {
      name: "violet",
      code: "#8F1EC6"
    },
  ]

  constructor(public dialogRef: MatDialogRef<AddNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NoteData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  token: string = localStorage.getItem('token');

  userInfo: Patient;

  me: any;
  
  // Bs variables

  public bsChartData: ChartDataSets[] = [
    { data: [] },
  ];
  public bsChartLabels: Label[] = [];
  public bsChartOptions: (ChartOptions) = {
    responsive: true,
  };
  public bsChartColors: Color[] = [
    { // diabetips blue
      backgroundColor: 'rgba(0,161,224,0.2)',
      borderColor: 'rgba(0,161,224,1)',
      pointBackgroundColor: 'rgba(0,161,224,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(0,161,224,0.8)'
    },
  ];
  public bsChartLegend = false;
  public bsChartType: ChartType = 'line';

  // Hb variables

  public hbChartData: ChartDataSets[] = [
    { data: [] },
  ];
  public hbChartLabels: Label[] = [];
  public hbChartOptions: (ChartOptions) = {
    responsive: true,
  };
  public hbChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(0,161,224,0.2)',
      borderColor: 'rgba(0,161,224,1)',
      pointBackgroundColor: 'rgba(0,161,224,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(0,161,224,0.8)'
    },
  ];
  public hbChartLegend = false;
  public hbChartType: ChartType = 'line';
  
  // Insulin variables

  public insulinChartData: ChartDataSets[] = [
    { data: [] },
    { data: [] },
    { data: [] },
  ];
  public insulinChartLabels: Label[] = [];
  public insulinChartOptions: (ChartOptions) = {
    responsive: true,
  };
  public insulinChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(0,161,224,0.2)',
      borderColor: 'rgba(0,161,224,1)',
      pointBackgroundColor: 'rgba(0,161,224,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(0,161,224,0.8)'
    },
  ];
  public insulinChartLegend = false;
  public insulinChartType: ChartType = 'line';
  
  @ViewChildren( BaseChartDirective ) charts: QueryList<BaseChartDirective>
  
  // Notes variables

  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList) placeholder: CdkDropList;

  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public dragIndex: number;
  public activeContainer;
  
  // Planning variables


  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'Evenement de 3 jours',
      color: colors.red,
      actions: this.actions,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'Evenement sur 2 mois',
      color: colors.blue,
      allDay: true,
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'Evenement modifiable',
      color: colors.yellow,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
  ];

  activeDayIsOpen: boolean = true;

  // Variables end

  public dateLimits = [
    {
      limitName: "1 jour",
      index: 0
    },
    {
      limitName: "1 semaine",
      index: 1
    },
    {
      limitName: "1 mois",
      index: 2
    },
    {
      limitName: "3 mois",
      index: 3
    },
    {
      limitName: "6 mois",
      index: 4
    },
    {
      limitName: "1 an",
      index: 5
    },
  ]

  public currentLimit = this.dateLimits[2];

  public selectedDateLimit = new Date()

  constructor(
    private patientsService: PatientsService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private viewportRuler: ViewportRuler,
    private sanitizer: DomSanitizer,
  ) {
    this.userInfo = new Patient

    this.target = null;
    this.source = null;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      let uid = params.patient

      this.patientsService.getPatient(uid).subscribe(patient => {
        this.userInfo.uid = patient.uid;
        this.userInfo.email = patient.email;
        this.userInfo.first_name = patient.first_name;
        this.userInfo.last_name = patient.last_name;
      });
      this.patientsService.getPatientPicture(this.userInfo.uid).subscribe(picture => {
        this.userInfo.profile_picture = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(picture))
      });
      this.patientsService.getPatientMeals(uid).subscribe(meals => {
        meals.forEach(meal => {
          let ingredients = []
          meal.foods.forEach(food => {
            ingredients.push(food.food.name)
          })
          meal.recipes.forEach(recipe => {
            ingredients.push(recipe.recipe.name)
          })
          meal.ingredients = ingredients.join(", ")
        });
        this.userInfo.meals = meals;
      });
      this.patientsService.getPatientBiometrics(uid).subscribe(biometrics => {
        this.userInfo.biometrics = biometrics;
      });
      this.patientsService.getPatientPicture(uid).subscribe(picture => {
        this.userInfo.profile_picture = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(picture))
      });
      this.patientsService.getMe().subscribe(me => {
        this.me = me;
        this.patientsService.getPatientNotes(uid).subscribe(notes => {
          this.userInfo.notes = notes
        })
      });

      this.updateDateLimit(uid)
    })
  }

  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
  }

  // Main user informations functions

  saveChanges(): void {
    this.patientsService.updateGeneralBiometrics(this.userInfo.uid, parseInt(this.userInfo.biometrics.height), parseInt(this.userInfo.biometrics.mass))
  }

  deleteConnection(): void {
    const dialogRef = this.dialog.open(ConfirmDeletionComponent, {
      width: '25%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirm) {
        this.patientsService
          .deleteConnection(this.patientsService.connectedId, this.userInfo.uid);
        this.router.navigate(['accueil'])
      }
    });
  }

  // Timestamp functions

  timestampAsDate(time) {
    return moment(time).utc().format('DD/MM/YYYY HH:mm')
  }

  timestampAsDateNoHour(time) {
    return moment(time).utc().format('DD/MM/YYYY')
  }

  // Bs and Hb functions

  updateDateLimit(uid: string = null) {
    if (uid == null) {
      uid = this.userInfo.uid
    }

    if (this.selectedDateLimit == null) {
      return
    }

    let tmpDate = moment(this.selectedDateLimit)

    if (this.currentLimit.index == 0) {
      tmpDate.subtract(1, 'day').toISOString()
    } else if (this.currentLimit.index == 1) {
      tmpDate.subtract(1, 'week').toISOString()
    } else if (this.currentLimit.index == 2) {
      tmpDate.subtract(1, 'month').toISOString()
    } else if (this.currentLimit.index == 3) {
      tmpDate.subtract(3, 'month').toISOString()
    } else if (this.currentLimit.index == 4) {
      tmpDate.subtract(6, 'month').toISOString()
    } else if (this.currentLimit.index == 5) {
      tmpDate.subtract(1, 'year').toISOString()
    }

    this.patientsService.getPatientBsLimit(uid, tmpDate.toISOString(), this.selectedDateLimit.toISOString()).subscribe(blood_sugar => {
      this.userInfo.blood_sugar = blood_sugar;

      this.bsChartLabels.length = 0
      this.bsChartData[0].data.length = 0

      blood_sugar.reverse().forEach(measure => {
        this.bsChartLabels.push(this.timestampAsDateNoHour(measure.time))
        this.bsChartData[0].data.push(measure.value)
      });
      
      this.charts.toArray()[0].update()
    });

    this.patientsService.getPatientBsTarget(uid, tmpDate.toISOString(), this.selectedDateLimit.toISOString()).subscribe(targets => {
      this.userInfo.targets = targets;
    });
    
    this.patientsService.getPatientInsulinLimit(uid, tmpDate.toISOString(), this.selectedDateLimit.toISOString(), 1).subscribe(insulin => {
      this.userInfo.insulin = insulin;

      this.insulinChartLabels.length = 0
      this.insulinChartData[0].data.length = 0

      const insulinTypes = ["slow", "fast", "very_fast"];

      insulin.reverse().forEach(measure => {
        this.insulinChartLabels.push(this.timestampAsDateNoHour(measure.time))

        this.insulinChartData[0].data.push(measure.quantity)

        // if (measure.type == insulinTypes[0]) {
        //   this.insulinChartData[0].data.push(measure.quantity)
        // } else if (measure.type == insulinTypes[1]) {
        //   this.insulinChartData[1].data.push(measure.quantity)
        // } else if (measure.type == insulinTypes[2]) {
        //   this.insulinChartData[2].data.push(measure.quantity)
        // }
      });

      this.charts.toArray()[1].update()
    })

    this.patientsService.getPatientHbLimit(uid, tmpDate.toISOString(), this.selectedDateLimit.toISOString()).subscribe(hba1c => {
      this.userInfo.hba1c = hba1c;

      this.hbChartLabels.length = 0
      this.hbChartData[0].data.length = 0

      hba1c.reverse().forEach(measure => {
        this.hbChartLabels.push(this.timestampAsDateNoHour(measure.time))
        this.hbChartData[0].data.push(measure.value)
      });

      this.charts.toArray()[2].update()
    });
  }

  // Notes functions

  addNote(): void {
    const dialogRef = this.dialog.open(AddNoteComponent, {
      width: '25%',
      data: {
        title: undefined,
        content: undefined,
        color: {
          name: "bleu",
          code: "#01B5EA"
        }
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result.title || !result.content) {
        return
      }

      let newNote = {
        title: result.title,
        content: result.content,
        color: result.color.code,
        index: 0,
      }

      this.userInfo.notes.push(newNote)
      this.patientsService.addPatientNote(this.userInfo.uid, newNote)
    });
  }

  deleteNote(note): void {
    let toDelete = note.index - 1

    this.patientsService.deletePatientNote(this.userInfo.uid, note.id)
    this.userInfo.notes.splice(toDelete, 1)

    for (let i = toDelete; i < this.userInfo.notes.length; i++) {
      this.userInfo.notes[i].index -= 1
    }
  }
  
  dragMoved(e: CdkDragMove) {
    let point = this.getPointerPositionOnPage(e.event);

    this.listGroup._items.forEach(dropList => {
      if (__isInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  dropListDropped(ev) {
    if (!this.target)
      return;

    let phElement = this.placeholder.element.nativeElement;
    let parent = phElement.parentElement;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    this.patientsService.moveNote(this.userInfo.uid, this.userInfo.notes[this.sourceIndex], this.targetIndex)

    let tmp = this.userInfo.notes[this.sourceIndex]
    this.userInfo.notes[this.targetIndex].index = this.sourceIndex
    this.userInfo.notes[this.sourceIndex].index = tmp.index

    if (this.sourceIndex != this.targetIndex) {
      moveItemInArray(this.userInfo.notes, this.sourceIndex, this.targetIndex);
    }
  }

  dropListEnterPredicate = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop == this.placeholder)
      return true;

    if (drop != this.activeContainer)
      return false;

    let phElement = this.placeholder.element.nativeElement;
    let sourceElement = drag.dropContainer.element.nativeElement;
    let dropElement = drop.element.nativeElement;

    let dragIndex = __indexOf(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    let dropIndex = __indexOf(dropElement.parentElement.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';
      
      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentElement.insertBefore(phElement, (dropIndex > dragIndex 
      ? dropElement.nextSibling : dropElement));

    //this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    return false;
  }
  
  /** Determines the point of the page that was touched by the user. */
  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = __isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
      const scrollPosition = this.viewportRuler.getViewportScrollPosition();

      return {
          x: point.pageX - scrollPosition.left,
          y: point.pageY - scrollPosition.top
      };
  }

  // Planning functions
  
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action)
    console.log(event)
    // this.modalData = { event, action };
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  // Hb functions

  addHb(): void {
    const dialogRef = this.dialog.open(AddMeasureComponent, {
      width: '25%',
      data: {measure: undefined, time: undefined}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.measure && result.time) {
        this.patientsService.addHbMeasure(result.measure, result.time.toISOString(), this.userInfo.uid)
        this.updateDateLimit(this.userInfo.uid)
      }
    });
  }
}

// Notes functions

function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
};

/** Determines whether an event is a touch event. */
function __isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}

function __isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
  const {top, bottom, left, right} = dropList.element.nativeElement.getBoundingClientRect();
  return y >= top && y <= bottom && x >= left && x <= right; 
}
