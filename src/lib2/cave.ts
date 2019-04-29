/**
 * A cave is a subterraneous world where our mole appears.
 */

import { ICaveDef, ICaveCell } from "./types"

export default class Cave {
    static VOID = 0;
    static GROUND = 1;
    static WALL = 2;
    static ROCK = 3;
    static DIAM = 4;
    static MAGICWALL = 5;
    static SLIM = 6;
    static MOLE = 7;
    static EXIT = 8;
    static MONSTER = 9;
    static BUTTERFLY = 10;
    static BOOM = 11;

    private cells: ICaveCell[] = [];
    private rows: number = 0;
    private cols: number = 0;

    constructor(private def: ICaveDef) {
        this.initCells(def.data);
    }

    private initCells(data: string[]) {
        this.rows = data.length;
        this.cols = data[0].length;
        let lineNumber = 0;
        for (const line of data) {
            if (line.length !== this.cols) {
                console.error(this.def);
                throw Error(`Line #${lineNumber} must have a length of ${this.cols} but we found ${line.length}!`);
            }
            let position = 0;
            for (const char of line) {
                const cellType = TYPES_MAP[char];
                if (typeof cellType === 'undefined') {
                    console.error(this.def);
                    throw Error(`Unknown char "${char}" at line ${lineNumber} and position ${position}!`);
                }
                this.cells.push({
                    type: cellType,
                    dir: -1,
                    moving: false,
                    future: false,
                    vx: 0,
                    vy: 0
                });
                position++;
            }
            lineNumber++;
        };
    }

    move() {
        this.stabilize();
        let ptr = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[ptr];
                ptr++;
                if (cell.future) continue;
                switch (cell.type) {
                    case Cave.ROCK:
                        this.moveRock(cell, col, row);
                        break;
                }
            }
        }
    }

    /**
     * Stop any moving object.
     */
    private stabilize() {
        console.info("[Before stab.] this.cells=", this.cells);
        for (const cell of this.cells) {
            if (cell.future) {
                cell.future = false;
            }
            else if (cell.moving) {
                cell.type = Cave.VOID;
                cell.moving = false;
                cell.vx = 0;
                cell.vy = 0;
            }
        }
        console.info("[After stab.] this.cells=", this.cells);
    }

    private moveRock(cell: ICaveCell, col: number, row: number) {
        const below = this.getCell(col, row + 1);
        if (below.type == Cave.VOID) {
            cell.vy = 1;
            this.moveCellTo(cell, below);
            return;
        }
    }

    /**
     * `srcCell` wants to replace `dstCell` in a near future.
     */
    private moveCellTo(srcCell: ICaveCell, dstCell: ICaveCell) {
        dstCell.type = srcCell.type;
        dstCell.dir = srcCell.dir;
        dstCell.vx = srcCell.vx;
        dstCell.vy = srcCell.vy;
        srcCell.moving = true;
        dstCell.moving = true;
        dstCell.future = true;
    }

    private getCell(col: number, row: number): ICaveCell {
        const index = this.index(col, row);
        return this.cells[index];
    }

    /**
     * Return the index of the cell giten its (col,row) coordinates.
     * The cave is considered infinitely repeated in vertical and horizontal directions.
     */
    index(_col: number, _row: number): number {
        const { cols, rows } = this;
        let col = _col % cols;
        let row = _row % rows;
        while (col < 0) col += cols;
        while (row < 0) row += rows;
        return col + row * cols;
    }

    exportDefinition() {
        const def: ICaveDef = { data: [] };
        const { cols, rows } = this;
        for (let row = 0; row < rows; row++) {
            let line: string = '';
            for (let col = 0; col < cols; col++) {
                const cell = this.getCell(col, row);
                if (cell.future) line += " ";
                else line += REVERSE_TYPES_MAP[cell.type];
            }
            def.data.push(line);
        }
        return def;
    }
}


const TYPES_MAP: { [key: string]: number } = {
    " ": Cave.VOID,
    ".": Cave.GROUND,
    "w": Cave.WALL,
    "r": Cave.ROCK,
    "d": Cave.DIAM,
    "m": Cave.MAGICWALL,
    "+": Cave.SLIM,
    "E": Cave.MOLE,
    "X": Cave.EXIT,
    "@": Cave.MONSTER,
    "#": Cave.BUTTERFLY,
    "!": Cave.BOOM
};

const REVERSE_TYPES_MAP: { [key: number]: string } = {
    [Cave.VOID]: " ",
    [Cave.GROUND]: ".",
    [Cave.WALL]: "w",
    [Cave.ROCK]: "r",
    [Cave.DIAM]: "d",
    [Cave.MAGICWALL]: "m",
    [Cave.SLIM]: "+",
    [Cave.MOLE]: "E",
    [Cave.EXIT]: "X",
    [Cave.MONSTER]: "@",
    [Cave.BUTTERFLY]: "#",
    [Cave.BOOM]: "!"
};
