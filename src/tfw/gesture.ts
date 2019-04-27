/**
 * Here is the list of all parameters used if all the handlers.
 *
 * tap({ x: number, y: number, index: number })
 *
 */

import Moves from "./gesture/moves"
import BasicHandler from "./gesture/basic-handler"
import { IBasicEvent } from "./gesture/basic-handler.types"

const SYMBOL = Symbol("gesture");

let ID = 0;

type TGestureName = "tap" | "down" | "up"
    | "pan" | "pandown" | "panup" | "panvertical"
    | "swipe" | "swipedown" | "swipeup" | "swipevertical"
    | "swipeleft";
type TEventName = "keydown" | "keyup";
type THandlers = {
    [key: TGestureName | TEventName]: (event: IEvent) => void;
};

interface IEvent {
    preventDefault: () => void;
    stopPropagation: () => void;
    target: HTMLElement;
    x?: number;
    y?: number;
}

interface IInternalEvent {
    x?: number;
    y?: number;
    event: PointerEvent;
}

interface IPointer {
    isDown: boolean;
    moves: Moves;
    rect: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    type: string | null;
    time: number;
    id: number;
}

const STANDARD_EVENTS = ["keydown", "keyup"];

class Gesture {
    private readonly basicHandler: BasicHandler;
    private handlers: THandlers;
    private element: HTMLElement;
    private readonly pointers: IPointer[];
    private readonly id: number;

    constructor(private elem: HTMLElement) {
        elem[SYMBOL] = this;
        this.id = ID++;
        this.element = elem;
        this.handlers = {};
        this.basicHandler = new BasicHandler(
            elem,
            this.handleDown.bind(this),
            this.handleUp.bind(this),
            this.handleMove.bind(this)
        )
        this.pointers = new Array(3);
    }

    get identifier() { return this.id; }

    on(handlers: THandlers) {
        this.handlers = Object.assign(this.handlers, handlers);
        Object.keys(this.handlers).forEach(eventName => {
            if (STANDARD_EVENTS.indexOf(eventName) === -1) return;
            // This is a non-pointer event. (i.e., keyboard, resize, ...)
            this.element.addEventListener(eventName, this.handlers[eventName], false);
        });
    }

    /**
     * Check if a gesture has an handler attached.
     *
     * @param   {TGestureName[]}  gestureNames - Name of the gesture.
     * @returns {boolean} true if the gesture is mapped to a handler.
     */
    hasHandlerFor(...gestureNames: TGestureName[]): boolean {
        for (const gestureName of gestureNames) {
            if (typeof this.handlers[gestureName] === 'function') return true;
        }
        return false;
    }

    private getPointer(index: number) {
        const pointers = this.pointers;
        if (typeof pointers[index] === 'undefined') {
            pointers[index] = {
                isDown: false,
                moves: new Moves(0, 0),
                rect: { left: 0, top: 0, width: 0, height: 0 }
            }
        }
        return pointers[index];
    }

    private handleDown(event: IBasicEvent) {
        // We want not deal with more than 3 simultaneous touches.
        if (event.index > 2) return;

        const { element } = this;
        const ptr = this.getPointer(event.index);
        ptr.isDown = true;
        ptr.rect = element.getBoundingClientRect();
        const x = event.x - ptr.rect.left;
        const y = event.y - ptr.rect.top;
        ptr.moves.init(x, y);

        if (this.hasHandlerFor("down")) {
            this.handlers.down(Object.assign(event, { x, y }));
        }
    }

    private handleUp(event: IBasicEvent) {
        // We want not deal with more than 3 simultaneous touches.
        if (event.index > 2) return;

        const ptr = this.getPointer(event.index);
        ptr.isDown = false;
        const x = event.x - ptr.rect.left;
        const y = event.y - ptr.rect.top;
        ptr.moves.add(x, y);

        if (this.hasHandlerFor("up")) {
            this.handlers.up(Object.assign(event, { x, y }));
        }
        this.recognizeTap(event, ptr);
        this.recognizeSwipe(event, ptr);
    }

    private handleMove(event: IBasicEvent) {
        // We want not deal with more than 3 simultaneous touches.
        if (event.index > 2) return;

        const ptr = this.getPointer(event.index);
        const x = event.x - ptr.rect.left;
        const y = event.y - ptr.rect.top;
        ptr.moves.add(x, y);
        this.recognizePan(event, ptr);
    }

    private recognizeTap(evt: IBasicEvent, ptr: IPointer) {
        // A tap is recognized only if there is less than 400ms
        // between down and up, and if the pointer has not moves more
        // than 16px.
        if (!this.hasHandlerFor("tap") || ptr.moves.elapsedTime > 400) return;
        const moves = ptr.moves;
        const dx = Math.abs(moves.x - moves.startX);
        if (dx > 16) return;
        const dy = Math.abs(moves.y - moves.startY);
        if (dy > 16) return;

        evt.clear();
        this.handlers.tap(Object.assign(evt, { x: moves.x, y: moves.y }));
    }

    private recognizePan(evt: IBasicEvent, ptr: IPointer) {
        if (!ptr.isDown) return;
        this.recognizePanDown(evt, ptr);
        this.recognizePanUp(evt, ptr);
        if (this.hasHandlerFor("pan")) {
            const { x, y, startX, startY } = ptr.moves;
            this.handlers.pan(Object.assign(evt, { x, y, startX, startY }));
        }
    }

    private recognizePanDown(evt: IBasicEvent, ptr: IPointer) {
        if (!this.hasHandlerFor("pandown", "panvertical")) return;

        // Check that we are panning down.
        const moves = ptr.moves;
        const sx = Math.abs(moves.speedX);
        const sy = moves.speedY;
        if (sy < sx) return;
        // Check that the final point is beneath the initial one.
        const dx = Math.abs(moves.x - moves.startX);
        const dy = moves.y - moves.startY;
        if (dy < dx) return;

        if (this.hasHandlerFor("pandown")) {
            this.handlers.pandown(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
        if (this.hasHandlerFor("panvertical")) {
            this.handlers.panvertical(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
    }

    private recognizePanUp(evt: IBasicEvent, ptr: IPointer) {
        if (!this.hasHandlerFor("panup", "panvertical")) return;

        // Check that we are panning up.
        const moves = ptr.moves;
        const sx = Math.abs(moves.speedX);
        const sy = -moves.speedY;
        if (sy < sx) return;
        // Check that the final point is beneath the initial one.
        const dx = Math.abs(moves.x - moves.startX);
        const dy = moves.startY - moves.y;
        if (dy < dx) return;

        if (this.hasHandlerFor("panup")) {
            this.handlers.panup(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
        if (this.hasHandlerFor("panvertical")) {
            this.handlers.panvertical(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
    }

    private recognizeSwipe(evt: IBasicEvent, ptr: IPointer) {
        this.recognizeSwipeDown(evt, ptr);
        this.recognizeSwipeUp(evt, ptr);
        this.recognizeSwipeLeft(evt, ptr);
        if (this.hasHandlerFor("swipe")) {
            const { x, y, startX, startY } = ptr.moves;
            this.handlers.swipe(Object.assign(evt, { x, y, startX, startY }));
        }
    }

    private recognizeSwipeDown(evt: IBasicEvent, ptr: IPointer) {
        if (!this.hasHandlerFor("swipedown", "swipevertical")) return;

        // Check that we are panning down.
        const moves = ptr.moves;
        const sx = Math.abs(moves.speedX);
        const sy = moves.speedY;
        if (sy < sx) return;
        // Check that the final point is beneath the initial one.
        const dx = Math.abs(moves.x - moves.startX);
        const dy = moves.y - moves.startY;
        if (dy < dx) return;
        // Minimal speed for swipe: 100 pixels/second.
        const speed = dy / moves.elapsedTime;
        if (speed < 0.1) return;
        if (this.hasHandlerFor("swipedown")) {
            this.handlers.swipedown(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
        if (this.hasHandlerFor("swipevertical")) {
            this.handlers.swipevertical(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
    }

    private recognizeSwipeUp(evt: IBasicEvent, ptr: IPointer) {
        if (!this.hasHandlerFor("swipeup", "swipevertical")) return;

        // Check that we are panning up.
        const moves = ptr.moves;
        const sx = Math.abs(moves.speedX);
        const sy = moves.speedY;
        if (sy < sx) return;
        // Check that the final point is beneath the initial one.
        const dx = Math.abs(moves.x - moves.startX);
        const dy = moves.y - moves.startY;
        if (dy < dx) return;
        // Minimal speed for swipe: 100 pixels/second.
        const speed = dy / moves.elapsedTime;
        if (speed < 0.1) return;
        if (this.hasHandlerFor("swipeup")) {
            this.handlers.swipeup(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
        if (this.hasHandlerFor("swipevertical")) {
            this.handlers.swipevertical(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
    }

    private recognizeSwipeLeft(evt: IBasicEvent, ptr: IPointer) {
        if (!this.hasHandlerFor("swipeleft", "swipehorizontal")) return;

        // Check that we are panning left.
        const moves = ptr.moves;
        const sx = -moves.speedX;
        const sy = Math.abs(moves.speedY);
        if (sx < sy) return;
        // Check that the final point is beneath the initial one.
        const dx = moves.startX - moves.x;
        const dy = Math.abs(moves.y - moves.startY);
        if (dx < dy) return;
        // Minimal speed for swipe: 100 pixels/second.
        const speed = dx / moves.elapsedTime;
        if (speed < 0.1) return;
        if (this.hasHandlerFor("swipeleft")) {
            this.handlers.swipeleft(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
        if (this.hasHandlerFor("swipehorizontal")) {
            this.handlers.swipehorizontal(Object.assign(evt, { x: moves.x, y: moves.y }));
        }
    }
}

export default function(elem: HTMLElement): Gesture {
    if (!elem[SYMBOL]) {
        elem[SYMBOL] = new Gesture(elem);
    }
    return elem[SYMBOL];
}
