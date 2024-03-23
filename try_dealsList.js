const tradesButton = getEl(".fa-history");

let dealsList;
let closedDealsButton;

try {
  dealsList = getEl(".deals-list");
  closedDealsButton = getAllEl(".right-widget-container .flex-centered")[2];
  if (!dealsList) {
    tradesButton.click();
    dealsList = getEl(".deals-list");
  }
  if (!closedDealsButton) {
    closedDealsButton = getAllEl(".right-widget-container .flex-centered")[2];
  }
} catch (error) {
  // Обработка ошибки
  console.error("Произошла ошибка:", error.message);
}