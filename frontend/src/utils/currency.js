// Currency formatting utility for Euro
export const formatEuro = (amount) => {
  const number = parseFloat(amount)
  if (isNaN(number)) return '€0,00'
  
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)
}

// Alternative format without currency symbol for display
export const formatEuroAmount = (amount) => {
  const number = parseFloat(amount)
  if (isNaN(number)) return '0,00'
  
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)
}

export default { formatEuro, formatEuroAmount }
