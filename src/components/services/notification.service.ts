import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationData {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationData>();
  public notification$ = this.notificationSubject.asObservable();

  constructor() { }

  show(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', title?: string, duration: number = 5000) {
    this.notificationSubject.next({ message, type, title, duration });
  }

  success(message: string, title: string = 'Éxito', duration: number = 5000) {
    this.show(message, 'success', title, duration);
  }

  warning(message: string, title: string = 'Advertencia', duration: number = 5000) {
    this.show(message, 'warning', title, duration);
  }

  error(message: string, title: string = 'Error', duration: number = 5000) {
    this.show(message, 'error', title, duration);
  }

  info(message: string, title: string = 'Información', duration: number = 5000) {
    this.show(message, 'info', title, duration);
  }
}
