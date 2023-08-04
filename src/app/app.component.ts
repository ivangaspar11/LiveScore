import { Component, OnDestroy, OnInit,Output,EventEmitter } from '@angular/core';
import { Message } from '@stomp/stompjs';
import { WebSocketService } from './web-socket-service.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatchDetails,EventForMatch } from 'src/assets/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private webSocketService: WebSocketService,public router: Router) {}

  liveScores: any[] = [];
  matchDetails!: MatchDetails;
  result!: string;


 
  

  private websocketSubscription: Subscription | undefined;

  ngOnInit() {
    this.websocketSubscription = this.webSocketService.connect().subscribe(
      () => {
        // Connection successful, you can now receive WebSocket messages
        this.webSocketService.getMessageObservable().subscribe((message) => {
          try {
            this.liveScores = message;
          } catch (error) {
            console.error('Error parsing JSON:', error);
            this.liveScores = [];
          }
        });
        this.webSocketService.getDetailsMessageObservable().subscribe((details:MatchDetails)=>{
          try{
          this.matchDetails=details;
          }
          catch(error){
            console.error('Error parsing JSON:',error); 
          }
        })
      })

    
     
    }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
  
  public getMessageFromServer(){
    console.log('message recieved')
    this.webSocketService.getMessageObservable().subscribe((message:Message)=>{
      console.log('received message from server:',message.isBinaryBody);
    })
  }
  public sendMessageToServer() {
    // Send a message to the server
    const message = {
      type: 'update',
      data: {
        score: {
          home: 3,
          away: 1
        },
        time: '45+2'
      }
    };
    this.webSocketService.sendMessage(JSON.stringify(message));
  }
  onExpansionPanelClick(matchId: number) {
    // When an expansion panel is clicked, request the match details for the corresponding matchId
    this.webSocketService.requestMatchDetails(matchId);
  }

  isHomeEvent(livescore: any, event: any): boolean {
    return livescore.homeTeamName === event.teamName;
  }
}
