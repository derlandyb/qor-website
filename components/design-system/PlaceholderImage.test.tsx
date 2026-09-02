import { render } from "@testing-library/react";
import { PlaceholderImage } from "./PlaceholderImage";

describe("PlaceholderImage", () => {
  test("GIVEN it renders THEN it shows the fallback icon", () => {
    const { container } = render(<PlaceholderImage />);

    expect(container.querySelector("svg")).not.toBeNull();
  });
});
