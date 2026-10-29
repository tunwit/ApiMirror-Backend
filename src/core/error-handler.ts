import { ElysiaCustomStatusResponse, status } from "elysia";
import { DomainError } from "./error";

export function handleError({ error, code }: { error: unknown; code: string | number }) {
  if (error instanceof ElysiaCustomStatusResponse) return error;
  if (error instanceof DomainError) {
    return status(error.status, { message: error.message });
  }
  if (code === "PARSE") {
    return status(400, { message: "Request body must be valid JSON." });
  }
  if (code === "VALIDATION") {
    return status(422, { message: "Invalid request parameters or body." });
  }
  if (code === "INVALID_COOKIE_SIGNATURE") {
    return status(400, { message: "Invalid cookie signature." });
  }
  if (code === "INVALID_FILE_TYPE") {
    return status(422, { message: "Invalid file type." });
  }
  if (code === "NOT_FOUND") {
    return status(404, { message: "Resource not found." });
  }
  console.error(error);
  return status(500, { message: "Unable to complete the request." });
}
