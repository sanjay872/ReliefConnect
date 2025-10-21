import { describe, it, expect } from "vitest";
import { recommend, createOrder, getOrder } from "../src/services/api";

describe("api service exports", () => {
  it("exports recommend/createOrder/getOrder functions", () => {
    expect(typeof recommend).toBe("function");
    expect(typeof createOrder).toBe("function");
    expect(typeof getOrder).toBe("function");
  });
});
