import { BadRequestError } from "../../core/error";
import type { CreateMockRouteDto } from "./mock-routes.dto";

function usesBodyPlaceholder(value: unknown): boolean {
  if (typeof value === "string") return /\{\{\s*body\.([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/.test(value);
  if (Array.isArray(value)) return value.some(usesBodyPlaceholder);
  if (value !== null && typeof value === "object") return Object.values(value).some(usesBodyPlaceholder);
  return false;
}

export function validateRequestBodyConfiguration(
  route: Pick<CreateMockRouteDto, "method" | "requiredBody" | "responseBody">,
) {
  if (route.method !== "GET" && route.method !== "HEAD") return;
  if (route.requiredBody.length > 0 || usesBodyPlaceholder(route.responseBody)) {
    throw new BadRequestError(`${route.method} routes cannot require body fields or use {{body.name}} placeholders.`);
  }
}
