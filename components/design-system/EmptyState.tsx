export interface EmptyStateProps {
  message: string;
}

/** Generic empty-list message, NIGHTLIFE-GV-styled (muted secondary text on the deep base surface). */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <p role="status" className="px-4 py-12 text-center text-[14px] text-[#9A9FB0]">
      {message}
    </p>
  );
}
