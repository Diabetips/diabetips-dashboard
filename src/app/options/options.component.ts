import { Component, OnInit, Input, Inject, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, ViewChildren } from '@angular/core';
import { Diabetolog } from '../patients-service/profile-classes';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
  selector: 'app-confirm-deactivation',
  templateUrl: 'confirm-deactivation.html',
  styleUrls: ['../app.component.css']
})
export class ConfirmDeactivationComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmDeactivationComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-confirm-reinitialisation',
  templateUrl: 'confirm-reinitialisation.html',
  styleUrls: ['../app.component.css']
})
export class ConfirmReinitialisationComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmReinitialisationComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  providers: [],
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {
  userInfo: Diabetolog;
  newProfile: Diabetolog;
  isMe: boolean;

  token: string = localStorage.getItem('token');
  editing: boolean = false;

  newImage: any = null;
  
  @ViewChild('myChart', { static: false }) myChart;

  constructor( private patientsService: PatientsService, public dialog: MatDialog ) {
    this.userInfo = new Diabetolog
    this.newProfile = new Diabetolog
  }

  async ngOnInit() {
    await this.patientsService.getMe()
      .subscribe(patient => {
        this.userInfo = patient;
        this.newProfile = patient;
        this.newProfile.profile_picture = this.patientsService.getPatientPicture(this.newProfile.uid)
      });
  }
  
  editProfile(): void {
    this.editing = !this.editing;
  }

  saveChanges(): void {
    this.patientsService.updatePatient(this.newProfile, this.userInfo.uid)
      .subscribe(resp => {
        this.userInfo = resp;
        this.newProfile = resp
      });
    this.editProfile();
  }

  onFileChanged(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
          this.newImage = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    }
    console.log(event.target.result)
    this.newProfile.profile_picture = event.target.files[0];
  }

  onUpload() {
    console.log("uploading " + this.newProfile.profile_picture)
    this.patientsService.updateNewPicture(this.newProfile.profile_picture);
  }

  reinitialisePassword(): void {
    const dialogRef = this.dialog.open(ConfirmReinitialisationComponent, {
      width: '25%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirm) {
        this.patientsService.reinitialisePassword(this.userInfo.email);
      }
    });
  }

  deactivateAccount(): void {
    const dialogRef = this.dialog.open(ConfirmDeactivationComponent, {
      width: '25%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirm) {
        this.patientsService.deactivateAccount(this.userInfo.uid);
      }
    });
  }
}