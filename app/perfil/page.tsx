"use client";

/**
 * W22 — profile, scoped to basic fields only (AUTH-17-19, AUTH-25; Stitch
 * screen ee5dea95cc384522b7705c2eb44ac552's social sections — stats,
 * agenda, recommendations — are deliberately NOT replicated here, per this
 * task's own scope note; that's Milestone 2's W35). birthdate is
 * display-only — updateProfile's payload doesn't accept it (name/phone/
 * email only), matching what qor-api's ProfileController actually allows.
 */
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "../../components/design-system/FormField";
import { Button } from "../../components/design-system/Button";
import { ConfirmModal } from "../../components/design-system/ConfirmModal";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api/http";

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : "Erro inesperado.";
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, error, update, uploadPicture, exportData, deleteAccount } = useProfile();
  const { logout } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    // Synchronizing local form state with the server-owned profile once it
    // loads (not derivable from props/state at render time) — same
    // rationale as the fetch-on-mount hooks' own setState-in-effect uses.
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(profile.name);
      setPhone(profile.phone ?? "");
      setEmail(profile.email);
    }
  }, [profile]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    try {
      await update({ name, phone: phone || undefined, email });
      setSuccessMessage("Perfil atualizado com sucesso.");
    } catch (err) {
      setFormError(messageOf(err));
    }
  }

  async function handlePictureChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadPicture(file);
    } catch (err) {
      setFormError(messageOf(err));
    }
  }

  async function handleExport() {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meus-dados.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setFormError(messageOf(err));
    }
  }

  async function handleConfirmDelete() {
    setConfirmDeleteOpen(false);
    try {
      await deleteAccount();
      await logout();
      router.push("/");
    } catch (err) {
      setFormError(messageOf(err));
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-[#9A9FB0]">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p role="alert" className="text-sm text-[#FF4D4D]">
          {error}
        </p>
      </div>
    );
  }

  if (!profile) return null;

  const pendingEmail = "pending_email" in profile ? profile.pending_email : null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">Meu Perfil</h1>

      {formError && (
        <p role="alert" className="text-sm text-[#FF4D4D]">
          {formError}
        </p>
      )}
      {successMessage && (
        <p role="status" className="text-sm text-[#2EC5FF]">
          {successMessage}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {profile.profile_picture_url && (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded picture, not a static local asset
          <img
            src={profile.profile_picture_url}
            alt="Foto de perfil"
            className="h-20 w-20 rounded-full object-cover"
          />
        )}
        <label htmlFor="profile-picture" className="text-[13px] text-[#9A9FB0]">
          Foto de perfil
        </label>
        <input id="profile-picture" type="file" accept="image/*" onChange={(e) => void handlePictureChange(e)} />
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
        <TextField id="profile-name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField id="profile-phone" label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField id="profile-email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {pendingEmail && (
          <p className="text-[13px] text-[#FFAB00]">
            Novo e-mail pendente de confirmação: {pendingEmail}
          </p>
        )}
        <TextField id="profile-birthdate" label="Data de nascimento" value={profile.birthdate} disabled readOnly />
        <Button type="submit">Salvar</Button>
      </form>

      <div className="flex flex-col gap-2 border-t border-[#2A2E3B] pt-4">
        <h2 className="text-[15px] font-semibold text-[#F5F6FA]">Seus dados</h2>
        <button
          type="button"
          onClick={() => void handleExport()}
          className="text-left text-[13px] text-[#2EC5FF] underline"
        >
          Exportar meus dados
        </button>
        <button
          type="button"
          onClick={() => setConfirmDeleteOpen(true)}
          className="text-left text-[13px] text-[#FF4D4D] underline"
        >
          Excluir minha conta
        </button>
      </div>

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Excluir sua conta?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
