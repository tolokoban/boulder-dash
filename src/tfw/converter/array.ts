export default function castArray(v: any): any[] {
    if( Array.isArray(v)) return v;
    return [v];
}
