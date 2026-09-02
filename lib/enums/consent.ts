/** Mirrors `QOR\App\Domain\User\Enum\ConsentType` (api/src/Domain/User/Enum/ConsentType.php). */
export const CONSENT_TYPE_VALUES = ["terms", "location"] as const;
export type ConsentType = (typeof CONSENT_TYPE_VALUES)[number];
