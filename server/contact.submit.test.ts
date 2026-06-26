import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module so tests don't need a real database
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  createContactSubmission: vi.fn().mockResolvedValue(undefined),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("contact.submit", () => {
  it("accepts a valid contact form submission and returns success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Hiring enquiry",
      message: "I would like to discuss a VA role.",
      service: "va",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts a submission without optional fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Bob",
      email: "bob@example.com",
      message: "Just reaching out.",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects an empty name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "",
        email: "test@example.com",
        message: "Hello",
      })
    ).rejects.toThrow();
  });

  it("rejects an invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "Test",
        email: "not-an-email",
        message: "Hello",
      })
    ).rejects.toThrow();
  });

  it("rejects an empty message", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "Test",
        email: "test@example.com",
        message: "",
      })
    ).rejects.toThrow();
  });
});
