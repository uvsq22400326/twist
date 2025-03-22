import { NextRequest } from "next/server";

declare module "next/server" {
  export interface RouteHandlerParams {
    params: Record<string, string>;
  }

  export type RouteHandler = (
    request: NextRequest,
    context: RouteHandlerParams
  ) => Promise<Response> | Response;
}
