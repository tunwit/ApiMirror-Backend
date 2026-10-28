import type { MockRoute } from "./mock-routes.schema";

export class MockRoutesMapper {
  toDto(route: MockRoute) {
    return {
      id: route.id,
      projectId: route.projectId,
      method: route.method,
      path: route.path,
      statusCode: route.statusCode,
      responseBody: route.responseBody,
      requiredBody: route.requiredBody,
      createdAt: route.createdAt.toISOString(),
      updatedAt: route.updatedAt.toISOString(),
    };
  }
}
