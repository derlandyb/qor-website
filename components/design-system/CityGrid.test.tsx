import { render, screen } from "@testing-library/react";
import { CityGrid } from "./CityGrid";
import { CITY_LABELS } from "../../lib/enums/city";

describe("components/design-system/CityGrid.tsx", () => {
  test("GIVEN the grid renders THEN it shows all 4 city labels, each as a link to /eventos?city=<value>", () => {
    render(<CityGrid />);

    expect(screen.getByRole("link", { name: CITY_LABELS.vitoria })).toHaveAttribute(
      "href",
      "/eventos?city=vitoria",
    );
    expect(screen.getByRole("link", { name: CITY_LABELS.vila_velha })).toHaveAttribute(
      "href",
      "/eventos?city=vila_velha",
    );
    expect(screen.getByRole("link", { name: CITY_LABELS.serra })).toHaveAttribute(
      "href",
      "/eventos?city=serra",
    );
    expect(screen.getByRole("link", { name: CITY_LABELS.cariacica })).toHaveAttribute(
      "href",
      "/eventos?city=cariacica",
    );
  });
});
