export interface Listener<T> {
    (event: T): any;
}
export interface Disposable {
    dispose(): void;
}
/** passes through events as they happen. You will not get events from before you start listening */
export declare class TypedEvent<T> {
    private listeners;
    private listenersOncer;
    on: (listener: Listener<T>) => Disposable;
    once: (listener: Listener<T>) => void;
    off: (listener: Listener<T>) => void;
    emit: (event: T) => void;
    pipe: (te: TypedEvent<T>) => Disposable;
}
