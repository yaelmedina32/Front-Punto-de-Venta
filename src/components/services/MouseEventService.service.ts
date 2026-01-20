import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MouseEventService {

  private mouseEnterSource = new Subject<boolean>();
  mouseEnter$ = this.mouseEnterSource.asObservable(); 


  emitirMouseEnter(isEntered: boolean): void {
    this.mouseEnterSource.next(isEntered); 
  }
}
