export interface IBasicEvent {
    x: number;
    y: number;
    startX?: number;
    startY?: number;
    index: number;
    buttons: number;
    pointer: "mouse" | "touch" | "pen";
    clear: ()=>void;
}
