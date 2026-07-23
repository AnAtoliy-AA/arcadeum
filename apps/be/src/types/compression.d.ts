declare module 'compression' {
  import type { RequestHandler } from 'express';
  function compression(): RequestHandler;
  export = compression;
}
