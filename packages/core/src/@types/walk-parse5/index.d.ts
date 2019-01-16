declare module 'walk-parse5' {
    import { Document, DefaultTreeElement } from 'parse5';
    function walk(document : Document, it : (node : DefaultTreeElement ) => void) : boolean;
    export = walk
}