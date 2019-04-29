export interface ICaveDef {
    data: string[];
}

export interface ICaveCell {
    type: number;
    // Is moving?
    moving: boolean;
    // If true, this cell is VOID but will set at the next step.
    future: boolean;
    // -1: still, 0: up, 1: right, 2: down, 3: left.
    dir: -1 | 0 | 1 | 2 | 3;
    vx: number;
    vy: number;
}
