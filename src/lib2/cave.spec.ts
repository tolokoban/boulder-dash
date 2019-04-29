import Cave from "./cave"

function cmp(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function failIfDifferent(steps: string[][], index: number, got: string[]) {
    const expected = steps[index];
    if (cmp(expected, got)) return false;
    const origin = steps[0];
    let error = "\n\n";
    for (let i = 0; i < origin.length; i++) {
        for (let k = 0; k < index + 1; k++) {
            error += `|${steps[k][i]}`;
        }
        error += `||${got[i]}|\n`;
    }
    fail(error);
    return true;
}

function check(steps: string[][]) {
    const cave = new Cave({ data: steps[0] });
    let origin = steps[0];
    for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
        cave.move();
        const expected = steps[stepIdx];
        const got = cave.exportDefinition().data;
        if (failIfDifferent(steps, stepIdx, got)) break;
        origin = got;
    }
}

describe("Cave definition's export", () => {
    const cases1 = [
        ["Void", " "],
        ["Ground", "."],
        ["Wall", "w"],
        ["Rock", "r"],
        ["Diam", "d"],
        ["Magicwall", "m"],
        ["Slim", "+"],
        ["Mole", "E"],
        ["Exit", "X"],
        ["Monster", "@"],
        ["Butterfly", "#"]
    ];
    for (const [name, type] of cases1) {
        it(`Should return an unique cell of type ${name}`, () => {
            const cave = new Cave({ data: [type] });
            const expected = [type];
            const got = cave.exportDefinition().data;
            expect(got).toEqual(expected);
        })
    }

    const cases2 = [
        ["r", "w"],
        ["r.@", "d#w"],
        [
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            "w.r..r..w.r...d.w... .r.wr......w..rr..w",
            "w.......w......rwrr. ...w ..d...w....r.w",
            "w                                      w",
            "wd......w.r....rw.r. .. w..r..d.w..r.r.w",
            "w.......w.r....rw.r. r..w.....r.w++++++w",
            "wwwwwwwwwwwwwwwwwwww wwwwwwwwwwwwwwwwwww",
            "w....rr.w..r....w... ..rw....r..w   # rw",
            "w.......w.. ....w... ...w....r. w.....rw",
            "w                                      w",
            "wr..r...w....r..w..r ...w......dwr.....w",
            "wr....r.w..r..r.w... . rw.......wr...r.w",
            "w.r.....w...r...w... . rw.......w r..r.w",
            "wwwwwwwwwwwwwwwwwwww wwwwwwwwwwwwwwwwwww",
            "wr.  @..w....r.rw... ...w.rd..r.w......w",
            "w.....r.wr......w..d ...w ..r...w.r.rr.w",
            "w                                      w",
            "wd.. .r.wr....r.w.r. ..rw.r.r...w......w",
            "w.....r.wr..d...w... r..w..r....w...rr w",
            "w.d... rw..r....w.Ed r..w. .....w...rr w",
            "w.r.... w.. ..r.w.X. ...w....r.rw.... .w",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"
        ]
    ];
    for (const data of cases2) {
        it(`Should work with a ${data[0].length}x${data.length} cave`, () => {
            const cave = new Cave({ data });
            const expected = data.slice();
            const got = cave.exportDefinition().data;
            expect(got).toEqual(expected);
        })
    }
}),

    describe("Rock vertical fall", () => {
        /*it(`Should not fall above a wall`, () => {
            check([["r", "w"], ["r", "w"], ["r", "w"]]);
        });*/
        it(`Should fall until it hits a wall`, () => {
            check([
                ["r", " ", " ", "w"],
                [" ", "r", " ", "w"],
                [" ", " ", "r", "w"],
                [" ", " ", "r", "w"],
            ]);
        });
    });
