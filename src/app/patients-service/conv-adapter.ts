  
import { ChatAdapter, User, Message, ParticipantResponse, ChatParticipantStatus, ChatParticipantType } from 'ng-chat';
import { Observable, of, } from "rxjs";
import { map, catchError } from 'rxjs/operators';
import { PatientsService } from './patients.service';

export class ConvAdapter extends ChatAdapter {
    private userId: string;

    constructor(
        userId: string,
        private patientsService: PatientsService,
    ) {
        super();
        this.userId = userId;

        console.log("ConvAdapter setup and ready for action !")
    }

    listFriends(): Observable<ParticipantResponse[]> {
        // List connected users to show in the friends list
        // Sending the userId from the request body as this is just a demo 
        return this.patientsService.getConnections().pipe(map(data => {
            let participantResponseArray: ParticipantResponse[] = []

            data.forEach((element, i) => {
                participantResponseArray.push({
                    participant: {
                        participantType: ChatParticipantType.User,
                        id: element.uid,
                        status: ChatParticipantStatus.Online,
                        avatar: null,
                        displayName: element.email
                    },
                    metadata: {
                        totalUnreadMessages: 0
                    }
                })
            });
            return participantResponseArray
        }))
    }

    getMessageHistory(userId: any): Observable<Message[]> {
        // This could be an API call to your NodeJS application that would go to the database
        // and retrieve a N amount of history messages between the users.
        return of([]);
    }

    sendMessage(message: Message): void {
        // this.patientsService.sendMessage()
    }
}