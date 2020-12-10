import { BehaviorSubject, Observable } from 'rxjs';

export interface IWebsocketService {
    on<T>(initEvent: string, updateEvent: string): Observable<T>;
    send(event: string, data: any): void;
    status: Observable<boolean>;
    publicStatus: BehaviorSubject<boolean>;
}

export interface WebSocketConfig {
    url: string;
    reconnectInterval?: number;
    reconnectAttempts?: number;
}

export interface IWsMessage<T> {
    event: string;
    data: T;
}
