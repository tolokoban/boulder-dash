export interface IPack {
    id: string;
    title: string;
    shortDescription: string;
    longDescription?: string;
    background?: string;
    traceIds?: number[];
}

export interface IAction {
    type: string;
    [key: string]: any;
}

export interface IAppState {
    packs: IPack[];
    refreshingPacks: boolean;
}
