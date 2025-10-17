export function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  if (n > 50) return 1; // Prevención de overflow
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function poissonPDF(k: number, lambda: number): number {
  if (lambda < 0) return 0;
  if (lambda === 0) return k === 0 ? 1 : 0;
  
  // Usar aproximación logarítmica para lambdas grandes
  if (lambda > 20) {
    return Math.exp(-lambda + k * Math.log(lambda) - logFactorial(k));
  }
  
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}

function logFactorial(n: number): number {
  if (n === 0 || n === 1) return 0;
  let result = 0;
  for (let i = 2; i <= n; i++) {
    result += Math.log(i);
  }
  return result;
}