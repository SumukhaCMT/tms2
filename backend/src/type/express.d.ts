import "express";

declare global {
  namespace Express {
    interface User {
      id: number;
      user_type: string;
      organization_id: number;
      temple_id: number;
      role_id: number;
      is_internal: boolean;
      session_id: number;
      permissions: Record<string, number>;
      expired: string[];
    }

    interface Request {
      user?: User;
    }
  }
}

export { };