import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Patient } from '../patients-service/profile-classes';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';

moment.locale('fr')

export interface MeasureData {
  measure: number;
}

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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userInfo: Patient;
  newProfile: Patient;
  isMe: boolean;

  public selectedData = 'bloodsugar'

  token: string = localStorage.getItem('token');
  uid: string;
  editing: boolean = false;
  
  constructor(
    private patientsService: PatientsService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.userInfo = new Patient
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
      this.userInfo.profile_picture = this.patientsService.getPatientPicture(this.uid)
    })
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
      if (result.measure && result.timestamp) {
        this.patientsService.addHbMeasure(result.measure, result.timestamp.getTime(), this.userInfo.uid)
        this.hbChartData[0].data.push(result.measure)
        this.hbChartLabels.push(this.timestampAsDateNoHour(result.timestamp.getTime()/1000))
        this.chart.chart.update()
      }
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
