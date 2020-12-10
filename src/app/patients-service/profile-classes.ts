import { SafeUrl } from '@angular/platform-browser';
import { CalendarEvent } from 'angular-calendar';

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
    targets: any;
    notes: any;
    prediction_enabled: boolean;
    last_prediction_confidence: any;
    predictions_precision: any;
    predictions: any;
    events: CalendarEvent[];

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
        this.targets = {}
        this.notes = []
        this.prediction_enabled = false
        this.last_prediction_confidence = 0
        this.predictions_precision = 0
        this.predictions = []
        this.events = []
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