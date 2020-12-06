  
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
    }

    listFriends(): Observable<ParticipantResponse[]> {
        return this.patientsService.getConnections().pipe(map(data => {
            let participantResponseArray: ParticipantResponse[] = []

            // Treat all connections and convert them into ParticipantResponses
            data.forEach((element, i) => {
                participantResponseArray.push({
                    participant: {
                        participantType: ChatParticipantType.User,
                        id: element.uid,
                        status: ChatParticipantStatus.Online,
                        avatar: null,
                        displayName: element.first_name + ' ' + element.last_name.toUpperCase()
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
        return this.patientsService.getConversation(userId).pipe(map(data => {
            let participantResponseArray: Message[] = []

            // Treat all connections and convert them into ParticipantResponses
            data.reverse().forEach((element, i) => {
                participantResponseArray.push({
                    fromId: element.from,
                    toId: element.to,
                    message: element.content
                })
            });
            return participantResponseArray
        }))
    }

    sendMessage(message: Message): void {
        this.patientsService.sendMessage(message.toId, message.message)
    }
}