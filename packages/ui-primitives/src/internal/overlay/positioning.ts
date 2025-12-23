export type OverlayPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end';

const placements = new Set<OverlayPlacement>([
  'bottom-start',
  'bottom',
  'bottom-end',
  'top-start',
  'top',
  'top-end',
]);

export const defaultPlacement: OverlayPlacement = 'bottom-start';

export function resolvePlacement(
  value: string | null | undefined,
  fallback: OverlayPlacement = defaultPlacement,
): OverlayPlacement {
  if (value && placements.has(value as OverlayPlacement)) {
    return value as OverlayPlacement;
  }
  return fallback;
}
