import { isEventLive } from "./isLive";

describe("isEventLive", () => {
  test("GIVEN a published event whose starts_at is in the future THEN it is not live", () => {
    expect(isEventLive("published", "2099-12-31T22:00:00Z")).toBe(false);
  });

  test("GIVEN a published event whose starts_at has already passed THEN it is live", () => {
    expect(isEventLive("published", "2020-01-01T22:00:00Z")).toBe(true);
  });

  test("GIVEN an ended event whose starts_at has passed THEN it is not live", () => {
    expect(isEventLive("ended", "2020-01-01T22:00:00Z")).toBe(false);
  });

  test("GIVEN a draft event whose starts_at has passed THEN it is not live", () => {
    expect(isEventLive("draft", "2020-01-01T22:00:00Z")).toBe(false);
  });
});
