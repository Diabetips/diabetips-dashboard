export class Patient {
    uid: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture: any;
    hba1c: any;
    insulin: any;

    constructor() {
        this.uid = "ph"
        this.email = "ph"
        this.first_name = "ph"
        this.last_name = "ph"
        this.profile_picture = undefined
        this.hba1c = []
        this.insulin = []
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