/**
 * Scan level image and convert it into ILevelDef.
 * Example of level image:
 * https://www.boulder-dash.nl/down/maps/PeterLiepa/BoulderDash01_cave04_level1.png
 *
 * Images are surrounded by a black margin of 4 pixels.
 * Each cell is a square of 16x16 pixels. But each pixel is 2x1.
 *
 */

const MARGIN = 4;
const CELL_W = 8;
const CELL_H = 16;

const MODELS = [
    // Wall
    [
        new Uint16Array([300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 0, 0, 300, 300, 0, 0, 300, 300, 300, 0, 300, 300, 300, 0, 300, 300, 765, 0, 300, 300, 765, 0, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 0, 0, 300, 300, 0, 0, 300, 300, 300, 0, 300, 300, 300, 0, 300, 300, 765, 0, 300, 300, 765, 0, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300]),
        "w"
    ],
    [
        new Uint16Array([0, 765, 765, 765, 0, 765, 765, 765, 0, 300, 765, 765, 0, 300, 765, 765, 0, 300, 300, 300, 0, 300, 300, 300, 0, 0, 0, 0, 0, 0, 0, 0, 765, 765, 0, 765, 765, 765, 0, 765, 765, 765, 0, 300, 765, 765, 0, 300, 300, 300, 0, 300, 300, 300, 0, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 765, 765, 765, 0, 765, 765, 765, 0, 300, 765, 765, 0, 300, 765, 765, 0, 300, 300, 300, 0, 300, 300, 300, 0, 0, 0, 0, 0, 0, 0, 0, 765, 765, 0, 765, 765, 765, 0, 765, 765, 765, 0, 300, 765, 765, 0, 300, 300, 300, 0, 300, 300, 300, 0, 300, 0, 0, 0, 0, 0, 0, 0, 0]),
        "w"
    ],
    // Ground
    [
        new Uint16Array([0, 0, 321, 0, 0, 321, 0, 321, 321, 321, 0, 0, 321, 0, 0, 321, 0, 321, 300, 321, 0, 321, 300, 0, 321, 321, 0, 321, 321, 321, 0, 321, 321, 0, 321, 321, 321, 0, 321, 321, 0, 300, 321, 0, 321, 300, 321, 0, 300, 321, 321, 300, 300, 0, 321, 321, 321, 0, 321, 321, 321, 321, 300, 0, 0, 321, 321, 321, 300, 321, 321, 321, 321, 300, 0, 321, 321, 321, 300, 0, 321, 300, 321, 0, 300, 321, 0, 321, 0, 300, 321, 321, 0, 321, 300, 321, 321, 0, 321, 0, 321, 0, 321, 0, 321, 321, 0, 0, 321, 321, 0, 321, 321, 0, 321, 300, 0, 321, 0, 0, 0, 321, 0, 0, 321, 0, 321, 0]),
        "."
    ],
    // Rock
    [
        new Uint16Array([0, 0, 765, 765, 765, 0, 0, 0, 0, 765, 300, 765, 321, 765, 0, 0, 765, 321, 765, 300, 765, 765, 765, 0, 300, 765, 321, 300, 321, 765, 765, 765, 300, 300, 300, 321, 300, 765, 765, 765, 300, 321, 300, 300, 300, 321, 300, 765, 300, 300, 321, 321, 300, 300, 765, 765, 300, 300, 300, 300, 300, 321, 300, 765, 300, 0, 300, 300, 300, 300, 300, 321, 300, 300, 0, 300, 300, 321, 300, 321, 300, 0, 300, 300, 300, 300, 300, 300, 300, 300, 0, 300, 300, 300, 300, 300, 300, 300, 300, 0, 300, 300, 300, 0, 0, 300, 300, 300, 300, 300, 300, 0, 0, 0, 300, 0, 321, 300, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0]),
        "r"
    ],
    // Void
    [
        new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        " "
    ],
    // Diam
    [
        new Uint16Array([0, 0, 0, 300, 765, 0, 0, 0, 0, 0, 0, 321, 300, 0, 0, 0, 0, 0, 300, 300, 300, 765, 0, 0, 0, 0, 321, 765, 765, 300, 0, 0, 0, 300, 765, 765, 765, 765, 765, 0, 0, 321, 300, 300, 300, 300, 300, 0, 300, 321, 321, 321, 321, 321, 321, 765, 321, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 765, 321, 321, 321, 321, 321, 321, 321, 300, 0, 300, 300, 300, 300, 300, 765, 0, 0, 321, 765, 765, 765, 765, 300, 0, 0, 0, 300, 765, 765, 765, 0, 0, 0, 0, 321, 300, 300, 300, 0, 0, 0, 0, 0, 321, 300, 0, 0, 0, 0, 0, 0, 321, 321, 0, 0, 0]),
        "d"
    ],
    // Entrance
    [
        new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 0, 0, 300, 0, 0, 0, 0, 300, 300, 300, 300, 0, 0, 0, 300, 0, 300, 300, 0, 300, 0, 0, 300, 0, 300, 300, 0, 300, 0, 0, 0, 300, 300, 300, 300, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 300, 300, 300, 300, 0, 0, 0, 300, 0, 765, 765, 0, 300, 0, 0, 765, 0, 300, 300, 0, 765, 0, 0, 0, 0, 765, 765, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 321, 765, 765, 321, 0, 0, 0, 0, 321, 0, 0, 321, 0, 0, 0, 0, 321, 0, 0, 321, 0, 0, 0, 765, 765, 0, 0, 765, 765, 0]),
        "E"
    ],
    // Exit
    [
        new Uint16Array([300, 300, 300, 300, 300, 300, 300, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 0, 0, 0, 0, 0, 0, 300, 300, 300, 300, 300, 300, 300, 300, 300]),
        "X"
    ],
    // Monster
    [
        new Uint16Array([765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 437, 437, 437, 437, 437, 437, 765, 765, 437, 437, 437, 437, 437, 437, 765, 765, 437, 0, 0, 0, 0, 437, 765, 765, 437, 0, 0, 0, 0, 437, 765, 765, 437, 0, 437, 437, 0, 437, 765, 765, 437, 0, 437, 437, 0, 437, 765, 765, 437, 0, 437, 437, 0, 437, 765, 765, 437, 0, 437, 437, 0, 437, 765, 765, 437, 0, 0, 0, 0, 437, 765, 765, 437, 0, 0, 0, 0, 437, 765, 765, 437, 437, 437, 437, 437, 437, 765, 765, 437, 437, 437, 437, 437, 437, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765, 765]),
        "@"
    ]
];

function parseUrl(url: string) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => parseImage(img, resolve);
        img.onerror = err => reject(err);
        img.src = url;
    });
}


function parseImage(img, resolve) {
    const imgW = img.width;
    const imgH = img.height;
    const canvasW = (imgW - 2 * MARGIN) / 2;
    const canvasH = imgH - 2 * MARGIN;
    const canvas = createCanvas(canvasW, canvasH);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
        img, MARGIN, MARGIN,
        imgW - 2 * MARGIN, imgH - 2 * MARGIN,
        0, 0, canvasW, canvasH
    );

    console.log(getSignature(ctx, 14, 5).toString());

    const level = [];
    const cols = Math.floor(canvasW / CELL_W);
    const rows = Math.floor(canvasH / CELL_H);
    for (let row = 0; row < rows; row++) {
        let line = "";
        for (let col = 0; col < cols; col++) {
            const signature = getSignature(ctx, row, col);
            line += recognize(signature);
        }
        level.push(line);
    }

    console.info(JSON.stringify(level, null, "  "));
    document.body.appendChild(canvas);
}


function recognize(sign: Uint16Array): string {
    let bestCell = "?";
    let bestDist = 2000000000;

    MODELS.forEach(model => {
        const [modelSign, modelCell] = model;
        const dist = computeDist(sign, modelSign);
        if (dist < bestDist) {
            bestCell = modelCell;
            bestDist = dist;
        }
    })

    return bestCell;
}


function computeDist(a: Uint16Array, b: Uint16Array) {
    let dist = 0;
    for (let k = 0; k < CELL_W * CELL_H; k++) {
        const v = Math.abs(a[k] - b[k]);
        dist += v * v;
    }
    return dist;
}


function getSignature(ctx: CanvasRenderingContext2D, row: number, col: number): Uint16Array {
    const xC = col * CELL_W;
    const yC = row * CELL_H;
    const data = ctx.getImageData(xC, yC, CELL_W, CELL_H).data;
    const output = new Uint16Array(CELL_W * CELL_H);
    let ptrSrc = 0;
    let ptrDst = 0;
    for (let y = 0; y < CELL_H; y++) {
        for (let x = 0; x < CELL_W; x++) {
            output[ptrDst] =
                data[ptrSrc]
                + data[ptrSrc + 1]
                + data[ptrSrc + 2];
            ptrDst++;
            ptrSrc += 4;
        }
    }
    return output;
}

function createCanvas(width: number, height: number) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    return canvas;
}


export default { parseUrl };
