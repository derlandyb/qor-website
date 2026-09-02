import { render, screen, waitFor } from "@testing-library/react";
import { GoogleMap } from "./GoogleMap";

const originalEnv = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

describe("GoogleMap", () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalEnv;
    delete (window as { google?: unknown }).google;
  });

  test("GIVEN no API key configured WHEN it renders THEN it falls back to a Google Maps search link", async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    render(<GoogleMap address="Rua X, 123, Vitória, ES" />);

    const link = await screen.findByRole("link", { name: "Abrir no Google Maps" });
    expect(link).toHaveAttribute("href", expect.stringContaining("Rua%20X"));
  });

  test("GIVEN the script is already loaded and geocoding succeeds WHEN it renders THEN it shows the map container", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-key";
    const location = { lat: () => -20.3, lng: () => -40.3 };
    (window as unknown as { google: unknown }).google = {
      maps: {
        Geocoder: class {
          geocode(
            _req: unknown,
            callback: (results: { geometry: { location: unknown } }[] | null, status: string) => void,
          ) {
            callback([{ geometry: { location } }], "OK");
          }
        },
        Map: class {},
        Marker: class {},
      },
    };

    render(<GoogleMap address="Rua X, 123, Vitória, ES" />);

    await waitFor(() =>
      expect(screen.getByRole("img", { name: "Mapa de Rua X, 123, Vitória, ES" })).toBeInTheDocument(),
    );
  });

  test("GIVEN geocoding fails WHEN it renders THEN it falls back to the search link", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-key";
    (window as unknown as { google: unknown }).google = {
      maps: {
        Geocoder: class {
          geocode(_req: unknown, callback: (results: null, status: string) => void) {
            callback(null, "ZERO_RESULTS");
          }
        },
        Map: class {},
        Marker: class {},
      },
    };

    render(<GoogleMap address="Endereço inexistente" />);

    await screen.findByRole("link", { name: "Abrir no Google Maps" });
  });
});
