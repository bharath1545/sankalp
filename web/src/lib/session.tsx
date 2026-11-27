"use client";

import { createContext, useContext } from "react";

/**
 * Who is signed in. UI only. The backend decides roles and access (T026).
 * `role` is for display. Never use it to guard anything.
 */
export interface SessionUser {
  name?: string;
  email: string;
  role: "user" | "admin";
}

export interface SessionValue {
  user: SessionUser | null;
  signOut: () => void | Promise<void>;
}

/** Default is signed out. No auth exists yet, so nothing provides a user. */
export const SessionContext = createContext<SessionValue>({
  user: null,
  signOut: () => {},
});

export const useSession = () => useContext(SessionContext);
