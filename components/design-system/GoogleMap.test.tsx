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

  describe("multi-pin mode (T22/MAPUI-01..04)", () => {
    /** Captures every listener registered on the mock Map/Marker instances so tests can fire them manually. */
    class FakeMarker {
      static instances: FakeMarker[] = [];
      listeners: Record<string, () => void> = {};
      constructor(public opts: { position: { lat: number; lng: number }; map: unknown; title?: string }) {
        FakeMarker.instances.push(this);
      }
      addListener(event: string, cb: () => void) {
        this.listeners[event] = cb;
      }
    }

    class FakeMap {
      static instances: FakeMap[] = [];
      listeners: Record<string, () => void> = {};
      constructor(public el: unknown, public opts: unknown) {
        FakeMap.instances.push(this);
      }
      addListener(event: string, cb: () => void) {
        this.listeners[event] = cb;
      }
      getBounds() {
        return {
          getNorthEast: () => ({ lat: () => -20.1, lng: () => -40.1 }),
          getSouthWest: () => ({ lat: () => -20.5, lng: () => -40.5 }),
        };
      }
    }

    function installFakeGoogleMaps() {
      FakeMarker.instances = [];
      FakeMap.instances = [];
      (window as unknown as { google: unknown }).google = {
        maps: { Map: FakeMap, Marker: FakeMarker },
      };
    }

    const pins = [
      { id: 1, lat: -20.3, lng: -40.3, title: "Show A" },
      { id: 2, lat: -20.4, lng: -40.4, title: "Show B" },
    ];

    beforeEach(() => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-key";
      installFakeGoogleMaps();
    });

    test("GIVEN geocoded events WHEN the map renders THEN one marker is created per pin (MAPUI-01)", async () => {
      render(<GoogleMap pins={pins} />);

      await waitFor(() => expect(FakeMarker.instances).toHaveLength(2));
      expect(FakeMarker.instances.map((m) => m.opts.position)).toEqual([
        { lat: -20.3, lng: -40.3 },
        { lat: -20.4, lng: -40.4 },
      ]);
    });

    test("GIVEN a rendered pin WHEN it is clicked THEN onPinClick is called with that event's id (MAPUI-02)", async () => {
      const onPinClick = jest.fn();
      render(<GoogleMap pins={pins} onPinClick={onPinClick} />);

      await waitFor(() => expect(FakeMarker.instances).toHaveLength(2));
      FakeMarker.instances[1]!.listeners.click!();

      expect(onPinClick).toHaveBeenCalledWith(2);
    });

    test("GIVEN the map WHEN the viewport's first idle fires (initial render) THEN onBoundsChanged is NOT called", async () => {
      const onBoundsChanged = jest.fn();
      render(<GoogleMap pins={pins} onBoundsChanged={onBoundsChanged} />);

      await waitFor(() => expect(FakeMap.instances).toHaveLength(1));
      FakeMap.instances[0]!.listeners.idle!();

      expect(onBoundsChanged).not.toHaveBeenCalled();
    });

    test("GIVEN the map WHEN the viewport idles a second time (user pan/zoom) THEN onBoundsChanged fires with the new bounds (MAPUI-03)", async () => {
      const onBoundsChanged = jest.fn();
      render(<GoogleMap pins={pins} onBoundsChanged={onBoundsChanged} />);

      await waitFor(() => expect(FakeMap.instances).toHaveLength(1));
      FakeMap.instances[0]!.listeners.idle!(); // initial idle — swallowed
      FakeMap.instances[0]!.listeners.idle!(); // user pan/zoom

      expect(onBoundsChanged).toHaveBeenCalledWith({ north: -20.1, south: -20.5, east: -40.1, west: -40.5 });
    });

    test("GIVEN no API key configured WHEN it renders in multi-pin mode THEN it shows a pt-BR error instead of a blank map", async () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      render(<GoogleMap pins={pins} />);

      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar o mapa.");
    });

    test("GIVEN no geocoded events WHEN it renders THEN the map still renders with zero markers (no error)", async () => {
      render(<GoogleMap pins={[]} />);

      await waitFor(() => expect(FakeMap.instances).toHaveLength(1));
      expect(FakeMarker.instances).toHaveLength(0);
      expect(screen.getByRole("img", { name: "Mapa de eventos" })).toBeInTheDocument();
    });
  });
});
