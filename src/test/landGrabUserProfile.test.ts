import { describe, it, expect, beforeEach } from "vitest";
import {
  loadUserProfile,
  saveUserProfile,
  resolveUsername,
  DEFAULT_USERNAME,
  MAX_USERNAME_LENGTH,
  USER_PROFILE_STORAGE_KEY,
} from "@/features/landGrab/userProfile";

describe("resolveUsername", () => {
  it("trims surrounding whitespace", () => {
    expect(resolveUsername("  Captain  ")).toBe("Captain");
  });

  it("falls back to the default when empty or blank", () => {
    expect(resolveUsername("")).toBe(DEFAULT_USERNAME);
    expect(resolveUsername("   ")).toBe(DEFAULT_USERNAME);
  });

  it("clamps to the max length", () => {
    const long = "x".repeat(MAX_USERNAME_LENGTH + 10);
    expect(resolveUsername(long)).toHaveLength(MAX_USERNAME_LENGTH);
  });
});

describe("loadUserProfile / saveUserProfile", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns the default profile when nothing is stored", () => {
    expect(loadUserProfile()).toEqual({ schemaVersion: 1, username: DEFAULT_USERNAME });
  });

  it("round-trips a username through localStorage", () => {
    saveUserProfile({ schemaVersion: 1, username: "Skipper" });
    expect(loadUserProfile().username).toBe("Skipper");
  });

  it("resolves a stored username on read", () => {
    window.localStorage.setItem(
      USER_PROFILE_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, username: "  Skipper  " }),
    );
    expect(loadUserProfile().username).toBe("Skipper");
  });

  it("falls back to the default when storage is corrupt", () => {
    window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, "{ not json");
    expect(loadUserProfile().username).toBe(DEFAULT_USERNAME);
  });

  it("ignores an unknown schema version", () => {
    window.localStorage.setItem(
      USER_PROFILE_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, username: "Ghost" }),
    );
    expect(loadUserProfile().username).toBe(DEFAULT_USERNAME);
  });
});
