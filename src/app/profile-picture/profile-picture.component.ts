import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PatientsService } from '../patients-service/patients.service';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.css']
})
export class ProfilePictureComponent implements OnInit {

  @Input()
  uid: any

  imageSource: any
  isImageLoading = true

  constructor(
    private sanitizer: DomSanitizer,
    private patientsService: PatientsService
  ) { }

  ngOnInit(): void {
    this.isImageLoading = true
    this.patientsService.getPatientPicture(this.uid).subscribe(picture => {
      this.createImageFromBlob(picture)
      this.isImageLoading = false
    }, error => {
      this.isImageLoading = false
      console.log(error)
    });
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader()
    reader.addEventListener("load", () => {
      this.imageSource = this.sanitizer.bypassSecurityTrustUrl(reader.result as string)
    }, false)

    if (image) {
      reader.readAsDataURL(image)
    }
  }

}
