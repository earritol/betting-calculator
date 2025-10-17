export function calculateKelly(probability: number, odds: number): number {
  if (odds <= 1 || probability <= 0) return 0;
  const edge = (probability * odds) - 1;
  if (edge <= 0) return 0;
  const kellyFraction = edge / (odds - 1);
  return Math.min(kellyFraction, 0.10);
}