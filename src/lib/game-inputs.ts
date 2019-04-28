const STILL = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;
const SUICIDE = 5;
const START = 6;
const state = [0, 0, 0, 0, 0, 0, 0];

function clear() {
    state[0] = state[1] = state[2] = state[3] = state[4] = state[5] = 0;
}

// Mouvement à l'aide des touches du clavier.
document.addEventListener("keydown", function(evt) {
    var catchKey = true;
    switch (evt.key.toLowerCase()) {
        case 'arrowup':
            state[UP] = 1;
            break;
        case 'arrowright':
            state[RIGHT] = 1;
            break;
        case 'arrowdown':
            state[DOWN] = 1;
            break;
        case 'arrowleft':
            state[LEFT] = 1;
            break;
        case 'escape':
            state[SUICIDE] = 1;
            break;
        case 'space':
            state[START] = 1;
            break;
        default:
            catchKey = false;
    }
    if (catchKey) evt.preventDefault();
}, true);
document.addEventListener("keyup", function(evt) {
    switch (evt.key.toLowerCase()) {
        case 'arrowup':
            state[UP] = 0;
            break;
        case 'arrowright':
            state[RIGHT] = 0;
            break;
        case 'arrowdown':
            state[DOWN] = 0;
            break;
        case 'arrowleft':
            state[LEFT] = 0;
            break;
        case 'escape':
            state[SUICIDE] = 0;
            break;
        case 'space':
            state[START] = 0;
            break;
    }
}, true);

//=========
// GAMEPAD
//---------
let gamepad = null;

window.addEventListener("gamepadconnected", function(e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
    gamepad = e.gamepad;
});

window.addEventListener("gamepaddisconnected", function(e) {
    if (e.gamepad === gamepad) gamepad = null;
});


// Mouvement au toucher.
// Quand on arrête de toucher l'écran, le héro s'arrête.
// Sinon, il continue dans la direction courante.
// Pour définir une direction, il faut glisser son doigt
// dans la direction voulue en gardant le doigt sur l'écran.
var touchX, touchY, touchId = null;
var dir = '';
document.addEventListener("touchstart", function(evt) {
    // S'il y a déjà un doigt sur l'écran, on ignore les suivants.
    if (touchId) return;

    var touch = evt.changedTouches[0];
    touchId = touch.identifier;
    touchX = touch.clientX;
    touchY = touch.clientY;
    clear();
    if (touchX < screen.width / 2) dir = 'H';
    else dir = 'V';
});
document.addEventListener("touchmove", function(evt) {
    var touch = evt.changedTouches[0];
    // S'agit-il bien du premier doigt ?
    if (touch.identifier !== touchId) return;

    var vx = touch.clientX - touchX;
    var vy = touch.clientY - touchY;
    touchX += vx;
    touchY += vy;

    if (Math.abs(vx) < Math.abs(vy)) {
        // Déplacement vertical.
        state[LEFT] = state[RIGHT] = 0;
        if (vy > 1) {
            state[DOWN] = 1;
            state[UP] = 0;
        }
        else if (vy < -1) {
            state[DOWN] = 0;
            state[UP] = 1;
        }
    } else {
        // Déplacement horizontal.
        state[UP] = state[DOWN] = 0;
        if (vx > 1) {
            state[RIGHT] = 1;
            state[LEFT] = 0;
        }
        else if (vx < -1) {
            state[RIGHT] = 0;
            state[LEFT] = 1;
        }
    }
});

var context = {
    STILL: 0,
    UP: UP,
    RIGHT: RIGHT,
    DOWN: DOWN,
    LEFT: LEFT,
    SUICIDE: SUICIDE,
    START: START
};

Object.defineProperty(context, "action", {
    get: function() {
        if (gamepad) {
            const axes = gamepad.axes;
            let index = 0;
            let value = Math.abs(axes[0]);
            for (let k = 1; k < axes.length; k++) {
                const v = Math.abs(axes[k]);
                if (v > value) {
                    index = k;
                    value = v;
                }
            }
            if (value > .4) {
                value = axes[index];
                if (value > 0) {
                    // Right or down.
                    if (index % 2 === 0) return RIGHT;
                    return DOWN;
                } else {
                    // Left or up.
                    if (index % 2 === 0) return LEFT;
                    return UP;
                }
            }
            var pressedButtonIndex = -1;
            gamepad.buttons.forEach(function(button, idx) {
                if (button.pressed) pressedButtonIndex = idx;
            });
            if (pressedButtonIndex > -1) {
                if (pressedButtonIndex < 4) return SUICIDE;
                return START;
            }
        }
        if (state[UP]) return UP;
        if (state[RIGHT]) return RIGHT;
        if (state[DOWN]) return DOWN;
        if (state[LEFT]) return LEFT;
        if (state[SUICIDE]) return SUICIDE;
        return STILL;
    }
});

export default context;
