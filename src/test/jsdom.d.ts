// jsdom ships no types and @types/jsdom is not installed, so only what the render helper reads
declare module 'jsdom' {
  export class JSDOM {
    constructor(html?: string)
    readonly window: Window & typeof globalThis
  }
}
