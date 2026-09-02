import { CITY_VALUES, CITY_LABELS, CITY_ACCENT, type City } from "./city";
import { EVENT_STATUS_VALUES, type EventStatus } from "./event-status";
import { CONSENT_TYPE_VALUES, type ConsentType } from "./consent";

function fixtureEvent(city: City, status: EventStatus) {
  return { id: 1, city, status };
}

describe("City", () => {
  test.each(CITY_VALUES)("GIVEN city %s WHEN round-tripped through a fixture API response THEN it survives unchanged", (city) => {
    const event = fixtureEvent(city, "published");
    expect(event.city).toBe(city);
    expect(CITY_LABELS[city]).toBeTruthy();
    expect(CITY_ACCENT[city]).toBeTruthy();
  });
});

describe("EventStatus", () => {
  test.each(EVENT_STATUS_VALUES)("GIVEN status %s WHEN round-tripped through a fixture API response THEN it survives unchanged", (status) => {
    const event = fixtureEvent("vitoria", status);
    expect(event.status).toBe(status);
  });
});

describe("ConsentType", () => {
  function fixtureConsent(consentType: ConsentType) {
    return { consent_type: consentType };
  }

  test.each(CONSENT_TYPE_VALUES)("GIVEN consent type %s WHEN round-tripped through a fixture API response THEN it survives unchanged", (consentType) => {
    const payload = fixtureConsent(consentType);
    expect(payload.consent_type).toBe(consentType);
  });
});
