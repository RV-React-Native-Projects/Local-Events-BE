import { AuthContext } from "../middleware/auth";

// Extend Hono's context with our custom types
declare module "hono" {
  interface ContextVariableMap {
    user: AuthContext["user"];
  }
}
