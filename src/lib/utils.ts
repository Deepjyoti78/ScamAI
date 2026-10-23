// Utility: merge class names (replaces clsx/cn without adding a dependency)
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
