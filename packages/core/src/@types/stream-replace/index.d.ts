declare type ReplacementFunction = (...args : string[]) => string|undefined;

declare module 'stream-replace' {
    function replace(m : RegExp|string, replacement : string|ReplacementFunction) : NodeJS.ReadWriteStream;
    export = replace;
  }