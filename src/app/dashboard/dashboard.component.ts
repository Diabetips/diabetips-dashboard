import { Component, OnInit, Inject, ViewChild, NgModule } from '@angular/core';
import { Patient } from '../patients-service/profile-classes';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';

import {
  CdkDrag,
  CdkDragStart,
  CdkDropList, CdkDropListGroup, CdkDragMove, CdkDragEnter,
  moveItemInArray, DragDropModule
} from "@angular/cdk/drag-drop";
import {ViewportRuler} from "@angular/cdk/overlay";

import { DomSanitizer } from '@angular/platform-browser';

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
  color: string;
  note: string;
}

@Component({
  selector: 'app-add-note',
  templateUrl: 'add-note.html',
  styleUrls: ['./dashboard.component.css']
})
export class AddNoteComponent {

  constructor(public dialogRef: MatDialogRef<AddNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NoteData) { }

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
  userInfo: Patient;
  newProfile: Patient;

  me: any;

  public selectedData = 'bloodsugar'

  token: string = localStorage.getItem('token');
  uid: string;
  editing: boolean = false;

  @ViewChild(CdkDropListGroup, {static: false}) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList, {static: false}) placeholder: CdkDropList;

  public notes: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public dragIndex: number;
  public activeContainer;

  constructor(
    private patientsService: PatientsService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private viewportRuler: ViewportRuler,
    private sanitizer: DomSanitizer
  ) {
    this.userInfo = new Patient

    this.target = null;
    this.source = null;
  }

  public bsChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { display: false }
  };

  public bsChartLabels = [];
  public bsChartType = 'line';
  public bsChartLegend = true;
  public bsChartData = [{
    data: [],
    backgroundColor: "rgba(53, 191, 246, 0.425)",
    borderColor: "#4DCEFF",
    pointBackgroundColor: "#fff",
    pointBorderColor: "#4DCEFF",
    pointRadius: 5,
    pointHitRadius: 12,
  }];

  public hbChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { display: false }
  };

  public hbChartLabels = [];
  public hbChartType = 'line';
  public hbChartLegend = true;
  public hbChartData = [{
    data: [],
    backgroundColor: "#00000000",
    borderColor: "#4DCEFF",
    pointBackgroundColor: "#fff",
    pointBorderColor: "#4DCEFF",
    pointRadius: 5,
    pointHitRadius: 12,
  }];

  @ViewChild(BaseChartDirective, {static: false}) chart: BaseChartDirective;

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.uid = params.patient

      this.patientsService.getPatient(this.uid).subscribe(patient => {
        this.userInfo.uid = patient.uid;
        this.userInfo.email = patient.email;
        this.userInfo.first_name = patient.first_name;
        this.userInfo.last_name = patient.last_name;
      });
      this.patientsService.getPatientHb(this.uid).subscribe(hba1c => {
        this.userInfo.hba1c = hba1c;
        this.hbChartLabels = []
        this.hbChartData[0].data = []
        hba1c.reverse().forEach(measure => {
          this.hbChartLabels.push(this.timestampAsDateNoHour(measure.timestamp))
          this.hbChartData[0].data.push(measure.value)
        });
      });
      this.patientsService.getPatientBs(this.uid).subscribe(blood_sugar => {
        this.chart.chart.data.datasets[0].data = blood_sugar.reverse
        this.userInfo.blood_sugar = blood_sugar
        this.bsChartLabels = []
        this.bsChartData[0].data = []
        blood_sugar.reverse().forEach(measure => {
          this.bsChartLabels.push(this.timestampAsDate(measure.timestamp))
          this.bsChartData[0].data.push(measure.value)
        });
      });
      this.patientsService.getPatientInsulin(this.uid).subscribe(insulin => {
        this.userInfo.insulin = insulin;
      });
      this.patientsService.getPatientMeals(this.uid).subscribe(meals => {
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
      this.patientsService.getPatientBiometrics(this.uid).subscribe(biometrics => {
        this.userInfo.biometrics = biometrics;
      })
      this.patientsService.getPatientPicture(this.uid).subscribe(picture => {
        this.userInfo.profile_picture = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(picture))
      })
      this.patientsService.getMe().subscribe(me => {
        this.me = me;
        this.patientsService.getPatientNotes(me.uid, this.uid).subscribe(notes => {
          this.userInfo.notes = notes
        })
      })
    })
  }

  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
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

  dropListDropped() {
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

    this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
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

  addHb(): void {
    const dialogRef = this.dialog.open(AddMeasureComponent, {
      width: '25%',
      data: {measure: undefined, timestamp: undefined}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.measure && result.timestamp) {
        this.patientsService.addHbMeasure(result.measure, result.timestamp.getTime(), this.userInfo.uid)
        this.hbChartData[0].data.push(result.measure)
        this.hbChartLabels.push(this.timestampAsDateNoHour(result.timestamp.getTime()/1000))
        this.chart.chart.update()
      }
    });
  }

  addNote(): void {
    const dialogRef = this.dialog.open(AddNoteComponent, {
      width: '25%',
      data: {title: undefined, content: undefined, color: undefined}
    });
    
    dialogRef.afterClosed().subscribe(result => {
      let newNote = {
        title: result.title,
        content: result.content,
        color: result.color,
        index: 0,
      }
      this.userInfo.notes.push(newNote)
      this.patientsService.addPatientNote(this.me.uid, this.uid, newNote)
    });
  }

  timestampFromNow(ts: number) {
    var a = new Date(ts * 1000);
    return moment(a).fromNow();
  }

  timestampAsDate(ts: number) {
    var a = new Date(ts * 1000);
    return moment(a).format('DD/MM/YYYY HH:mm')
  }

  timestampAsDateNoHour(ts: number) {
    var a = new Date(ts * 1000);
    return moment(a).format('DD/MM/YYYY')
  }
}

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
