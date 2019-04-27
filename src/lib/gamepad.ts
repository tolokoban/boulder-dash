class GamepadListener {
    private _isConnected: boolean = false;
    private _gamepad;

    static UP: number = 0;
    static RIGHT: number = 1;
    static DOWN: number = 2;
    static LEFT: number = 3;

    constructor() {
        console.log("Gamepad...");
        window.addEventListener("gamepadconnected", e => this.handleConnected(e));
        window.addEventListener("gamepaddisconnected", e => this.handleDisconnected(e));
    }

    private handleConnected(evt) {
        console.log("[connect] evt=", evt);
        this._isConnected = true;
        this._gamepad = navigator.getGamepads()[0];

        setInterval(() => {
            const welcome = document.getElementById("welcome");
            welcome.textContent = JSON.stringify(this._gamepad.axes);
        }, 1000);
    }

    private handleDisconnected(evt) {
        console.log("[disconnect] evt=", evt);
        this._isConnected = true;
        delete this._gamepad;
    }

    get isConnected() { return this._isConnected; }

    read(): -1 | 0 | 1 | 2 | 3 {
        const gp = this._gamepad;
        if (!gp) return -1;
        const axes = gp.axes;
        let index = 0;
        let value = Math.abs(axes[0]);
        for (let k = 1; k < axes.length; k++) {
            const v = Math.abs(axes[k]);
            if (v > value) {
                index = k;
                value = v;
            }
        }
        if (value < .4) return -1;
        value = axes[index];
        if (value > 0) {
            // Right or down.
            if (index % 2 === 0) return this.RIGHT;
            return this.DOWN;
        } else {
            // Left or up.
            if (index % 2 === 0) return this.LEFT;
            return this.UP;
        }
    }
}


export default new GamepadListener();
