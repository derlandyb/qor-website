/**
 * Profile hook wrapping lib/api/client.ts's /profile endpoints. Scoped to
 * W22's "basic fields only" surface (get/update/picture/data-rights) — no
 * address/genre-preferences wiring here, that's Milestone 2's W35.
 */
import { useCallback, useEffect, useState } from "react";
import {
  deleteAccount,
  exportDataRights,
  getDataRightsAccess,
  getProfile,
  revokeConsent,
  updateProfile,
  uploadProfilePicture,
  type UpdateProfileFields,
} from "../lib/api/client";
import { ApiError } from "../lib/api/http";
import type { ConsentType } from "../lib/enums/consent";
import type { FanUser, UpdatedFanUser } from "../lib/api/types";

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : "Erro inesperado.";
}

export interface Profile {
  profile: FanUser | UpdatedFanUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (fields: UpdateProfileFields) => Promise<UpdatedFanUser>;
  uploadPicture: (file: File) => Promise<FanUser>;
  exportData: () => Promise<unknown>;
  getAccessSummary: () => Promise<unknown>;
  deleteAccount: () => Promise<void>;
  revokeConsent: (consentType: ConsentType) => Promise<void>;
}

export function useProfile(): Profile {
  const [profile, setProfile] = useState<FanUser | UpdatedFanUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProfile();
      setProfile(result.data);
    } catch (err) {
      setError(messageOf(err));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  const update = useCallback(async (fields: UpdateProfileFields) => {
    const result = await updateProfile(fields);
    setProfile(result.data);
    return result.data;
  }, []);

  const uploadPicture = useCallback(async (file: File) => {
    const result = await uploadProfilePicture(file);
    setProfile(result.data);
    return result.data;
  }, []);

  const exportData = useCallback(async () => (await exportDataRights()).data, []);

  const getAccessSummary = useCallback(async () => (await getDataRightsAccess()).data, []);

  const doDeleteAccount = useCallback(async () => {
    await deleteAccount();
  }, []);

  const doRevokeConsent = useCallback(async (consentType: ConsentType) => {
    await revokeConsent(consentType);
  }, []);

  return {
    profile,
    loading,
    error,
    refetch,
    update,
    uploadPicture,
    exportData,
    getAccessSummary,
    deleteAccount: doDeleteAccount,
    revokeConsent: doRevokeConsent,
  };
}
