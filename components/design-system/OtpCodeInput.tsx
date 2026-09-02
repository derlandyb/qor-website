"use client";

import { useEffect, useState } from "react";

export interface OtpCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onResend: () => Promise<void> | void;
  resendCooldownSeconds?: number;
}

/**
 * 6-digit OTP code entry, shared by /verificar-email (W20) and the
 * password-recovery wizard (W21) — both need the same code-input +
 * resend-with-cooldown UI.
 */
export function OtpCodeInput({
  value,
  onChange,
  error,
  onResend,
  resendCooldownSeconds = 60,
}: OtpCodeInputProps) {
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);

    return () => clearInterval(id);
  }, [cooldown]);

  async function handleResend() {
    await onResend();
    setCooldown(resendCooldownSeconds);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="otp-code" className="text-[13px] font-medium text-[#9A9FB0]">
        Código de verificação
      </label>
      <input
        id="otp-code"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        className="w-full rounded-[12px] border border-[#2A2E3B] bg-[#1B1E29] px-3 py-2 text-center text-[20px] tracking-[0.3em] text-[#F5F6FA] focus:outline-none focus:ring-2 focus:ring-[#2EC5FF]"
      />
      {error && (
        <p role="alert" className="text-xs text-[#FF4D4D]">
          {error}
        </p>
      )}
      <div className="text-[13px] text-[#9A9FB0]">
        Não recebeu o código?{" "}
        {cooldown > 0 ? (
          <span>Reenviar em {cooldown}s</span>
        ) : (
          <button type="button" onClick={() => void handleResend()} className="text-[#2EC5FF] underline">
            Reenviar
          </button>
        )}
      </div>
    </div>
  );
}
