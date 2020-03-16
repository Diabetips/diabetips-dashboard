export class Patient {
    uid: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture: any;
    hba1c: any;
    blood_sugar: any;
    insulin: any;
    meals: any;

    constructor() {
        this.uid = "ph"
        this.email = "ph"
        this.first_name = "ph"
        this.last_name = "ph"
        this.profile_picture = undefined
        this.insulin = []
        this.hba1c = []
        this.blood_sugar = []
        this.meals = []
    }
}

export class Diabetolog {
    uid: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture: any;

    constructor() {
        this.uid = "ph"
        this.email = "ph"
        this.first_name = "ph"
        this.last_name = "ph"
        this.profile_picture = undefined
    }
}