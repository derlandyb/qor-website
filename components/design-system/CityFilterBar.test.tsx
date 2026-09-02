import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CityFilterBar } from "./CityFilterBar";

describe("CityFilterBar", () => {
  test("GIVEN Vitória is active WHEN it renders THEN every city renders with the correct aria-pressed state", () => {
    render(<CityFilterBar activeCity="vitoria" onSelect={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Vitória" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Vila Velha" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Serra" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Cariacica" })).toHaveAttribute("aria-pressed", "false");
  });

  test("GIVEN the active city WHEN it renders THEN it gets the solid active classes, scale-105 included", () => {
    render(<CityFilterBar activeCity="cariacica" onSelect={jest.fn()} />);

    const cariacica = screen.getByRole("button", { name: "Cariacica" });
    expect(cariacica).toHaveClass("bg-[#B14EFF]", "text-white", "scale-105");
  });

  test("GIVEN the filter bar renders WHEN the nav container is queried THEN it hides its native scrollbar", () => {
    render(<CityFilterBar activeCity="vitoria" onSelect={jest.fn()} />);

    expect(screen.getByRole("navigation")).toHaveClass("scrollbar-hide");
  });

  test("GIVEN a city button WHEN clicked THEN onSelect fires with that city", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<CityFilterBar activeCity="vitoria" onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "Serra" }));

    expect(onSelect).toHaveBeenCalledWith("serra");
  });
});
