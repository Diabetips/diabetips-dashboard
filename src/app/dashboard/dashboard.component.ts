import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy, TemplateRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';

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
  parseISO,
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
import { catchError } from 'rxjs/operators';

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

export interface EventData {
  title: string;
  description: string;
  dateStart: any;
  dateEnd: any;
  eventId: any;
}

@Component({
  selector: 'app-add-event',
  templateUrl: 'add-event.html',
  styleUrls: ['./dashboard.component.css']
})
export class AddEventComponent {

  constructor(public dialogRef: MatDialogRef<AddEventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  token: string = localStorage.getItem('token');

  userInfo: Patient;

  // Bs variables

  public bsChartData: ChartDataSets[] = [
    { data: [] },
  ];
  public bsChartLabels: Label[] = [];
  public bsChartOptions: (ChartOptions) = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }],
      xAxes: [{
        ticks: {
          maxTicksLimit: 24
        }
      }]
    }
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
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
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
  ];
  public insulinChartLabels: Label[] = [];
  public insulinChartOptions: (ChartOptions) = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };
  public insulinChartColors: Color[] = [
    { // blue
      backgroundColor: 'rgba(0,161,224,0.2)',
      borderColor: 'rgba(0,161,224,1)',
      pointBackgroundColor: 'rgba(0,161,224,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(0,161,224,0.8)'
    },
    { // orange
      backgroundColor: 'rgba(255,162,0,0.2)',
      borderColor: 'rgba(255,162,0,1)',
      pointBackgroundColor: 'rgba(255,162,0,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255,162,0,0.8)'
    },
  ];
  public insulinChartLegend = false;
  public insulinChartType: ChartType = 'bar';
  
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

  refresh: Subject<any> = new Subject();

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
    private cdr: ChangeDetectorRef
  ) {
    this.userInfo = new Patient

    this.target = null;
    this.source = null;
  }

  private me = {}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      let uid = params.patient

      this.patientsService.getPatient(uid).subscribe(patient => {
        this.userInfo.uid = patient.uid;
        this.userInfo.email = patient.email;
        this.userInfo.first_name = patient.first_name;
        this.userInfo.last_name = patient.last_name;
      });
      this.patientsService.getPatientPicture(uid).subscribe(picture => {
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
      this.patientsService.getPatientNotes(uid).subscribe(notes => {
        this.userInfo.notes = notes
      })
      this.patientsService.getAllPlanningEvents().subscribe(events => {
        this.userInfo.events = []
        
        events.filter(event => {
          let containsPatient = false
          event.members.forEach(member => {
            if (member.uid == uid) {
              containsPatient = true
            }
          })
          return containsPatient
        })
        .forEach(event => {
          this.userInfo.events.push({
            start: parseISO(event.start),
            end: parseISO(event.end),
            title: event.title,
            color: {
              primary: '#e3bc08',
              secondary: '#FDF1BA',
            },
            meta: {
              description: event.description,
              id: event.id
            }
          })
        })
        this.refresh.next()
      })
      this.patientsService.getPredictionSettings(uid).subscribe(settings => {
        this.userInfo.prediction_enabled = settings.enabled
      })

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

  timestampHour(time) {
    return moment(time).utc().format('HH:mm')
  }

  changePredictionSettings() {
    this.patientsService.setPredictionSettings(this.userInfo.uid, this.userInfo.prediction_enabled)
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

    let tmpDateOneDay = moment(this.selectedDateLimit).subtract(1, 'day').toISOString()

    this.patientsService.getPatientBsLimitPage(uid, tmpDateOneDay, this.selectedDateLimit.toISOString(), 2).subscribe(blood_sugar => {
      this.userInfo.blood_sugar = blood_sugar;

      this.bsChartLabels.length = 0
      this.bsChartData[0].data.length = 0

      blood_sugar.reverse().forEach(measure => {
        this.bsChartLabels.push(this.timestampHour(measure.time))
        this.bsChartData[0].data.push(measure.value)
      });

      this.patientsService.getPatientBsLimit(uid, tmpDateOneDay, this.selectedDateLimit.toISOString()).subscribe(blood_sugar => {
        this.userInfo.blood_sugar = blood_sugar.concat(this.userInfo.blood_sugar);
  
        blood_sugar.reverse().forEach(measure => {
          this.bsChartLabels.push(this.timestampHour(measure.time))
          this.bsChartData[0].data.push(measure.value)
        });
  
        this.charts.toArray()[0].update()
      });
    });

    this.patientsService.getPatientBsTarget(uid, tmpDateOneDay, this.selectedDateLimit.toISOString()).subscribe(targets => {
      this.userInfo.targets = targets;
    });
    
    this.patientsService.getPredictionComparisonLimit(uid, tmpDateOneDay, this.selectedDateLimit.toISOString()).subscribe(insulin => {
      this.userInfo.insulin = insulin;

      this.insulinChartLabels.length = 0
      this.insulinChartData[0].data.length = 0
      this.insulinChartData[1].data.length = 0

      let comparisonsArray = []

      insulin.reverse().forEach(measure => {
        this.insulinChartLabels.push(this.timestampAsDate(measure.time))

        this.insulinChartData[0].data.push(measure.quantity)

        if (measure.prediction) {
          if (this.userInfo.last_prediction_confidence == 0 && measure.prediction.insulin != -1) {
            this.userInfo.last_prediction_confidence = measure.prediction.insulin
          }

          this.insulinChartData[1].data.push(measure.prediction.insulin)

          comparisonsArray.push((Math.abs(measure.quantity - measure.prediction.insulin) / measure.quantity))
        }
      });

      let errorRate = 0

      comparisonsArray.forEach(elem => errorRate += elem)

      this.userInfo.predictions_precision = errorRate

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

      this.patientsService.addPatientNote(this.userInfo.uid, newNote).subscribe(note => {
        this.userInfo.notes.push(note)
        this.cdr.detectChanges()
      })
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

  addEvent(): void {
    const dialogRef = this.dialog.open(AddEventComponent, {
      width: '25%',
      data: {
        title: "",
        description: "",
        dateStart: (new Date()).toISOString().slice(0, -8),
        dateEnd: undefined,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result.title) {
        return
      }

      this.patientsService.createPlanningEvent(result.title, result.description, result.dateStart, result.dateEnd, this.userInfo.uid)
      .subscribe(newEvent => {
        this.userInfo.events.push({
        start: parseISO(newEvent.start),
        end: parseISO(newEvent.end),
        title: newEvent.title,
        color: {
          primary: '#e3bc08',
          secondary: '#FDF1BA',
        },
        meta: {
          description: newEvent.description,
          id: newEvent.id
        }})
        this.refresh.next()
      })
    });
  }

  handleEvent(action: string, event: CalendarEvent): void {
    const dialogRef = this.dialog.open(AddEventComponent, {
      width: '25%',
      data: {
        title: event.title,
        description: event.meta.description,
        dateStart: (event.start).toISOString().slice(0, -8),
        dateEnd: (event.end).toISOString().slice(0, -8),
        eventId: event.meta.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return
      }

      if (result.delete) {
        this.patientsService.deletePlanningEvent(result.eventId)
        .subscribe(response => {})
        
        this.userInfo.events = this.userInfo.events.filter(event => {
          return event.meta.id != result.eventId
        })
        
        return
      }

      if (!result.title || !result.description || !result.dateStart || !result.dateEnd) {
        return
      }

      this.patientsService.editPlanningEvent(result.eventId, result.title, result.description, result.dateStart, result.dateEnd, this.userInfo.uid)
      .subscribe(editedEvent => {
        event.title = editedEvent.title
        event.start = parseISO(editedEvent.start)
        event.end = parseISO(editedEvent.end)
        event.title = editedEvent.title
        event.color = {
          primary: '#e3bc08',
          secondary: '#FDF1BA',
        }
        event.meta = {
          description: editedEvent.description,
          id: editedEvent.id
        }
        this.refresh.next()
      })
    });
  }
  
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
    this.userInfo.events = this.userInfo.events.map((iEvent) => {
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

  deleteEvent(eventToDelete: CalendarEvent) {
    this.userInfo.events = this.userInfo.events.filter((event) => event !== eventToDelete);
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
