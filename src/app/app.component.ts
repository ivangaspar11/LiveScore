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
  liveScoreDemo:any[]=[{"homeTeamName":"Hantharwady United","awayTeamName":"Kachin United","result":"2 : 0","elapsedTime":45,"homeTeamLogo":"https://media-3.api-sports.io/football/teams/12525.png","awayTeamLogo":"https://media-1.api-sports.io/football/teams/20967.png","matchId":1003710},{"homeTeamName":"Paris","awayTeamName":"Inter","result":"0 : 0","elapsedTime":19,"homeTeamLogo":"https://media-3.api-sports.io/football/teams/85.png","awayTeamLogo":"https://media-1.api-sports.io/football/teams/505.png","matchId":1030322}]

  matchDetails!: MatchDetails;
  homeTeamName!: string;
  awayTeamName!: string;
  result!: string;
  elapsedTime!: number;
matchDetailsDemo:MatchDetails={"eventForMatches":[{"timeElapsed":4,"teamName":"England W","playerName":"A. Russo","type":"Goal","detail":"Normal Goal"},{"timeElapsed":26,"teamName":"England M","playerName":"L. Hemp","type":"Goal","detail":"Normal Goal"},{"timeElapsed":41,"teamName":"England W","playerName":"L. James","type":"Goal","detail":"Normal Goal"},{"timeElapsed":45,"teamName":"England W","playerName":"L. James","type":"Var","detail":"Goal Disallowed - offside"},{"timeElapsed":46,"teamName":"England W","playerName":"L. Coombs","type":"subst","detail":"Substitution 1"},{"timeElapsed":56,"teamName":"England W","playerName":"L. Bronze","type":"Card","detail":"Yellow Card"}],"matchId":1013592};

 
 
  

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

    
console.log(this.matchDetailsDemo);
     
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
