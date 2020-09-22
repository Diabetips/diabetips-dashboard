import { SafeUrl } from '@angular/platform-browser';

export class Patient {
    uid: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture: SafeUrl;
    hba1c: any;
    blood_sugar: any;
    insulin: any;
    meals: any;
    biometrics: any;
    notes: any;

    constructor() {
        this.uid = "ph"
        this.email = "ph"
        this.first_name = "ph"
        this.last_name = "ph"
        this.insulin = []
        this.hba1c = []
        this.blood_sugar = []
        this.meals = []
        this.biometrics = {}
        this.notes = []
    }
}

export class Diabetolog {
    uid: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture: SafeUrl;

    constructor() {
        this.uid = "ph"
        this.email = "ph"
        this.first_name = "ph"
        this.last_name = "ph"
    }
}