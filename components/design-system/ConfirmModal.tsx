"use client";

import { Button } from "./Button";

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Minimal destructive-action confirm dialog — used by /perfil's delete-account action. */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md rounded-[16px] bg-[#1B1E29] p-6"
      >
        <h2 id="confirm-modal-title" className="text-lg font-bold text-[#F5F6FA]">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-[#9A9FB0]">{description}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[12px] px-4 py-2 text-sm text-[#9A9FB0] hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <Button variant="primary" type="button" onClick={onConfirm} className="w-auto bg-[#FF4D4D] hover:bg-[#FF4D4D]/90">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
