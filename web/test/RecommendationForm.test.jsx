import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import RecommendationForm from "../src/components/RecommendationForm";

describe("RecommendationForm (unit)", () => {
  it("is a function/component export", () => {
    expect(typeof RecommendationForm).toBe("function");
  });
});
