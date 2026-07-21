declare module "xhr" {
  export const xhr: any;
}

declare module "std/server" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: any
  ): void;
}

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  };
}
