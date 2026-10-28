import type { auth } from "../../auth";
import { AuthPlugin } from "./auth.plugin";

export function createAuthContainer(server: typeof auth, frontendUrl: string) {
  const plugin = new AuthPlugin(server, frontendUrl);
  const middleware = plugin.register();
  return { plugin, middleware };
}
