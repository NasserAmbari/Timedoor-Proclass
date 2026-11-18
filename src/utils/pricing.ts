export const FREE_SHIPPING_THRESHOLD = 500_000;
export const SHIPPING_FEE = 20_000;
export const TAX_RATE = 0.11;

export function calculateTotals(subtotal: number) {
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(subtotal * TAX_RATE);

  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

export const formatCurrency = (price: number | string): string => {
  if (typeof price === 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  }
  return price;
};
