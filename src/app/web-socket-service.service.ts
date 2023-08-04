import { Injectable } from '@angular/core';
import { Client, Message, Stomp, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client;
  private messageSubject: Subject<any> = new Subject<any>();
  private messageSubjectDetails: Subject<any> = new Subject<any>();
  private subscription!: StompSubscription;
  private detailsSubscription!: StompSubscription;
  private isConnected = false; // Add a flag to track the connection status

  constructor() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket)
    
  }

  public connect(): Observable<any> {
    return new Observable((observer) => {
      this.stompClient.onConnect = () => {
        console.log('WebSocket connected');
        this.isConnected=true;
        this.subscription = this.stompClient.subscribe('/topic/live-scores', (message) => {
         
          if (message.isBinaryBody) {
            try {
              const jsonString = new TextDecoder().decode(message.binaryBody);
              const matchInfoList= JSON.parse(jsonString);
              this.messageSubject.next(matchInfoList);
            } catch (error) {
              console.error('Error parsing JSON:', error);
              this.messageSubject.next([]);
            }
          }
        });
        this.detailsSubscription = this.stompClient.subscribe('/topic/details', (message) => {
         
          if (message.isBinaryBody) {
            try {
              const jsonString = new TextDecoder().decode(message.binaryBody);
              const matchInfoList= JSON.parse(jsonString);
              this.messageSubjectDetails.next(matchInfoList);
            } catch (error) {
              console.error('Error parsing JSON:', error);
              this.messageSubjectDetails.next([]);
            }
          }
        });
        observer.next(); // Notify the observer that the connection is successful
        observer.complete(); // Complete the observable after connection success
      };

      this.stompClient.onStompError = (frame) => {
        console.error('WebSocket error:', frame);
        observer.error(frame); // Notify the observer about the error
      };

      this.stompClient.activate();
    });
  }

  public disconnect() {
    if (this.stompClient.connected) {
      this.subscription.unsubscribe();
      this.detailsSubscription.unsubscribe();
      this.stompClient.deactivate();
      this.isConnected=false;
    }
  }

  public getMessageObservable(): Observable<any> {
    return this.messageSubject.asObservable();
  }
  public getDetailsMessageObservable(){
    return this.messageSubjectDetails.asObservable();
  }
  public sendMessage(message: string): void {
    if (this.isConnected) {
      this.stompClient.publish({
        destination: '/app/live-score', 
        body: message,
      });
    } else {
      console.error('WebSocket is not connected. Cannot send message.');
    }
  }

  public requestMatchDetails(matchId: number): void {
    if (this.isConnected) {
      const matchRequest = matchId;
      this.stompClient.publish({
        destination: '/app/live-score',
        body: JSON.stringify(matchRequest),
      });
    } else {
      console.error('WebSocket is not connected. Cannot send message.');
    }
  }
}
