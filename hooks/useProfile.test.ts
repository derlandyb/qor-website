import { renderHook, waitFor, act } from "@testing-library/react";
import { useProfile } from "./useProfile";
import * as client from "../lib/api/client";
import { ApiError } from "../lib/api/http";
import type { FanUser } from "../lib/api/types";

jest.mock("../lib/api/client");

const mockedClient = client as jest.Mocked<typeof client>;

function makeUser(overrides?: Partial<FanUser>): FanUser {
  return {
    id: 1,
    name: "Fã",
    email: "fa@example.com",
    phone: null,
    birthdate: "2000-01-01",
    profile_picture_url: null,
    email_verified: true,
    ...overrides,
  };
}

describe("useProfile", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GIVEN the hook mounts WHEN getProfile resolves THEN it exposes the profile", async () => {
    mockedClient.getProfile.mockResolvedValue({ data: makeUser() });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profile).toEqual(makeUser());
  });

  test("GIVEN getProfile rejects WHEN the hook mounts THEN it surfaces the error", async () => {
    mockedClient.getProfile.mockRejectedValue(new ApiError(500, "Erro interno."));

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Erro interno.");
  });

  test("GIVEN fields WHEN update is called THEN it updates the profile state", async () => {
    mockedClient.getProfile.mockResolvedValue({ data: makeUser() });
    mockedClient.updateProfile.mockResolvedValue({
      data: { ...makeUser({ name: "Novo Nome" }), pending_email: null },
    });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.update({ name: "Novo Nome" });
    });

    expect(result.current.profile?.name).toBe("Novo Nome");
  });

  test("GIVEN a picture file WHEN uploadPicture is called THEN it updates the profile state", async () => {
    mockedClient.getProfile.mockResolvedValue({ data: makeUser() });
    mockedClient.uploadProfilePicture.mockResolvedValue({
      data: makeUser({ profile_picture_url: "https://x/pic.png" }),
    });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File(["x"], "pic.png", { type: "image/png" });
    await act(async () => {
      await result.current.uploadPicture(file);
    });

    expect(result.current.profile?.profile_picture_url).toBe("https://x/pic.png");
  });

  test("WHEN exportData is called THEN it returns the export payload", async () => {
    mockedClient.getProfile.mockResolvedValue({ data: makeUser() });
    mockedClient.exportDataRights.mockResolvedValue({ data: { some: "data" } });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let exported;
    await act(async () => {
      exported = await result.current.exportData();
    });

    expect(exported).toEqual({ some: "data" });
  });

  test("WHEN getAccessSummary is called THEN it returns the access summary", async () => {
    mockedClient.getProfile.mockResolvedValue({ data: makeUser() });
    mockedClient.getDataRightsAccess.mockResolvedValue({ data: { access: true } });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let summary;
    await act(async () => {
      summary = await result.current.getAccessSummary();
    });

    expect(summary).toEqual({ access: true });
  });

  test("WHEN deleteAccount is called THEN it calls the endpoint", async () => {
    mockedClient.getProfile.mockResolvedValue({ data: makeUser() });
    mockedClient.deleteAccount.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(mockedClient.deleteAccount).toHaveBeenCalled();
  });

  test("GIVEN a consent type WHEN revokeConsent is called THEN it calls the endpoint with that type", async () => {
    mockedClient.getProfile.mockResolvedValue({ data: makeUser() });
    mockedClient.revokeConsent.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.revokeConsent("location");
    });

    expect(mockedClient.revokeConsent).toHaveBeenCalledWith("location");
  });
});
