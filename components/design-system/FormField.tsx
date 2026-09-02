import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface BaseFieldProps {
  label: string;
  error?: string;
}

interface FieldWrapperProps extends BaseFieldProps {
  htmlFor: string;
  children: ReactNode;
}

/**
 * design-system.md doesn't document form-input styling directly (§4 covers
 * cards/filters/buttons only) — this reuses the system's own surface/border
 * tokens and §3's documented focus ring (2px solid accent-blue,
 * outline-offset 2px, no animation — instant, for keyboard-nav clarity).
 */
const INPUT_CLASSES =
  "w-full rounded-[12px] border border-[#2A2E3B] bg-[#1B1E29] px-3 py-2 text-[14px] text-[#F5F6FA] placeholder:text-[#666B7D] focus:outline-none focus:ring-2 focus:ring-[#2EC5FF] focus:ring-offset-2 focus:ring-offset-[#0B0D14]";

function FieldWrapper({ label, htmlFor, error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-[#9A9FB0]">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-[#FF4D4D]">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  error,
  id,
  ...rest
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error}>
      <input id={id} className={INPUT_CLASSES} {...rest} />
    </FieldWrapper>
  );
}

export function TextAreaField({
  label,
  error,
  id,
  ...rest
}: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error}>
      <textarea id={id} className={INPUT_CLASSES} rows={4} {...rest} />
    </FieldWrapper>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({
  label,
  error,
  id,
  options,
  ...rest
}: BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[] }) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error}>
      <select id={id} className={INPUT_CLASSES} {...rest}>
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
