export interface IAssets {
    [key: string]: string;
}

export interface IEnvironment {
    assets: IAssets;
    bonus: 0;
    cellTime: 0;
    demoMode: boolean;
    divDiam: HTMLElement;
    divScore: HTMLElement;
    eatDiam: ()=>void;
    eatenDiams: number;
    explode: ()=>void;
    gl: WebGLRenderingContext;
    isHeroAlive: boolean;
    isLevelDone: boolean;
    killHero: ()=>void;
    levelNumber: number;
    life: number;
    nextLevel: ()=>void;
    nextSynchro: number;
    playBoom: ()=>void;
    score: number;
    w: number;
    x: number;
    y: number;
    z: number;
}

export interface ILevelDef {
    need: number;
    rows: string[];
}

export type TScore = [string, number]
export type TScores = TScore[];
