import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export interface RequestWithParsedQuery<T = unknown> extends Request {
  parsedQuery: T;
}
