// FORMATTING CURRENC MOZAMBIQUE
const formatMoney = (value) => {
  return new Intl.NumberFormat("pt-PT", {
    currency: "MZN",
    style: "currency",
    minimumFractionDigits: 2,
  }).format(value || 0);
};

module.exports = formatMoney;
