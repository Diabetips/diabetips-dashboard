import { Component, OnInit, Input, Inject } from '@angular/core';
import { Patient } from '../patients-service/patient';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  email: any;
  first_name: any;
  last_name: any;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditUserModalComponent {

  constructor(
    public dialogRef: MatDialogRef<EditUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [PatientsService],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @Input() userInfo: any;
  @Input() isMe: boolean;

  token: string = localStorage.getItem('token');

  constructor(
    private patientsService: PatientsService,
    public dialog: MatDialog ) {
  }

  ngOnInit() {
    this.patientsService.getMe()
      .subscribe(patient => this.userInfo = patient);
  }

  editProfile(): void {
    const dialogRef = this.dialog.open(EditUserModalComponent, {
      width: '50%',
      data: {email: this.userInfo.email, first_name: this.userInfo.first_name, last_name: this.userInfo.last_name}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.patientsService.updatePatient(result, this.userInfo.uid)
        .subscribe(resp => {
          console.log(resp);
        });
    });
  }
}

