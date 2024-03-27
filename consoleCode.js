function getEl(str) {
  return document.querySelector(str);
}

function getAllEl(str) {
  return document.querySelectorAll(str);
}

let currentCount = smallBets[0];

let smallBetLosses = 0;
let bigBetLosses = 0;

let bigBetWin = true;

const dealsList = getEl(".deals-list");
const symbolBlock = getEl(".current-symbol_cropped");
const currentSymbol = symbolBlock.textContent;
const expirationBlock = getEl(".block--expiration-inputs .value__val");
const expirationBlockTitle = getEl(".block__title");
const profitBlock = getEl(".estimated-profit-block__text--up");
let profitPercent = parseInt(profitBlock.textContent);
const valueInput = getEl(".value__val input");
const closedDealsButton = getAllEl(".right-widget-container .flex-centered")[2];

let hotKeysOn;
try {
  const hotKeysMode = getEl(".hotkeys-icon.tooltip2 .on");
  if (!hotKeysMode) {
    hotKeysOn = false;
  } else {
    hotKeysOn = true;
  }
} catch (error) {
  console.error("Произошла ошибка:", error.message);
}

function openHotKeysWindow() {
  const hotKeysWindow = getEl(".hotkeys-icon.tooltip2");
  hotKeysWindow.click();
}

function clickHotKeysButton() {
  const hotKeysOnButton = getEl(".po-modal .btn-green-light");
  hotKeysOnButton.click();
}

function openClosedDeals() {
  closedDealsButton.click();
  console.log("click!");
}

function setValueInput(input, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  nativeInputValueSetter.call(input, value);

  const e = new Event("input", { bubbles: true });
  input.dispatchEvent(e);
}

setValueInput(valueInput, "$" + currentCount);

const shiftPressEvent = new KeyboardEvent("keydown", {
  key: "Shift",
  keyCode: 16,
  shiftKey: true,
});

const wPressEvent = new KeyboardEvent("keydown", {
  key: "W",
  keyCode: 87,
  shiftKey: true,
});

const wReleaseEvent = new KeyboardEvent("keyup", {
  key: "W",
  keyCode: 87,
  shiftKey: true,
});

const sPressEvent = new KeyboardEvent("keydown", {
  key: "S",
  keyCode: 83,
  shiftKey: true,
});

const sReleaseEvent = new KeyboardEvent("keyup", {
  key: "S",
  keyCode: 83,
  shiftKey: true,
});

function buy() {
  document.dispatchEvent(shiftPressEvent);
  document.dispatchEvent(wPressEvent);
  setTimeout(function () {
    document.dispatchEvent(wReleaseEvent);
    document.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: "Shift",
        keyCode: 16,
        shiftKey: true,
      }),
    );
  }, 100);
  console.log("buy");
}

function sell() {
  document.dispatchEvent(shiftPressEvent);
  document.dispatchEvent(sPressEvent);
  setTimeout(function () {
    document.dispatchEvent(sReleaseEvent);
    document.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: "Shift",
        keyCode: 16,
        shiftKey: true,
      }),
    );
  }, 100);
  console.log("sell");
}

function makeDecision() {
  const randomValue = Math.random();
  const decisionThreshold = 0.5;

  if (randomValue < decisionThreshold) {
    sell();
  } else {
    buy();
  }
}

openClosedDeals();

const profitBlockObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "characterData" || mutation.type === "childList") {
      profitPercent = parseInt(profitBlock.textContent);
      if (profitPercent < 92) {
        stopBot();
        console.log(
          "The bot is stopped. Profit below 92% (" + profitPercent + "%)",
        );
        alert("The bot is stopped. Profit below 92% (=" + profitPercent + "%)");
      }
    }
  });
});

let block = false;

const dealsListObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (block) {
        smallBetLosses = 0;
        bigBetLosses = 0;
        currentCount = smallBets[smallBetLosses];
        block = false;
        bigBetWin = true;

        setValueInput(valueInput, "$" + currentCount);
        makeDecision();

        return;
      }

      if (node.nodeType === 1) {
        const itemRows = node.querySelectorAll(".item-row");

        if (itemRows.length > 0) {
          const lastItemRow = itemRows[itemRows.length - 1];
          const divElements = lastItemRow.querySelectorAll("div");
          const textArray = [];

          divElements.forEach((div) => {
            const textContent = div.textContent.trim();
            const numberValue = parseFloat(textContent.replace(/[^\d.]/g, ""));

            if (!isNaN(numberValue)) {
              textArray.push(numberValue);
            }
          });

          if (bigBetWin) {
            if (textArray[0] > textArray[1]) {
              if (smallBets.includes(currentCount)) {
                smallBetLosses += 1;

                if (smallBetLosses < smallBets.length) {
                  currentCount = smallBets[smallBetLosses];
                } else {
                  smallBetLosses = 0;
                  bigBetLosses += 1;
                  currentCount = bigBets[bigBetLosses - 1];
                }
              }
              // Если проиграли большую ставку, ждём одну в плюс, и только потом две в минус
              else {
                bigBetWin = false;
                currentCount = smallBets[0];
              }

              setValueInput(valueInput, "$" + currentCount);
            }

            if (textArray[0] < textArray[1]) {
              if (smallBets.includes(currentCount)) {
                smallBetLosses = 0;
                currentCount = smallBets[smallBetLosses];
              }
              if (bigBets.includes(currentCount)) {
                bigBetLosses = 0;
                smallBetLosses = 0;
                currentCount = smallBets[smallBetLosses];
              }
            }
            setValueInput(valueInput, "$" + currentCount);
          } else {
            if (textArray[0] > textArray[1]) {
              currentCount = smallBets[0];
            }

            if (textArray[0] < textArray[1]) {
              bigBetWin = true;
              currentCount = smallBets[0];
            }
          }

          if (currentCount >= maxBet) {
            block = true;
          }

          makeDecision();
        }
      }
    });
  });
});

if (expirationBlockTitle.textContent.includes("UTC")) {
  const timeBtn = getEl(".fa-flag-checkered");
  timeBtn.click();
}

function timeSetter() {
  if (expirationBlock.textContent != "00:00:05") {
    const expirationInputsBtn = getEl(
      ".control__value.value.value--several-items",
    );
    expirationInputsBtn.click();

    function setExpirationTime() {
      const hoursInput = getAllEl(".expiration-inputs-list-modal input")[0];
      const minutesInput = getAllEl(".expiration-inputs-list-modal input")[1];
      const secondsInput = getAllEl(".expiration-inputs-list-modal input")[2];

      setValueInput(hoursInput, "00");
      setValueInput(minutesInput, "00");
      setValueInput(secondsInput, "05");
    }

    setTimeout(setExpirationTime, 0);
  }
}

setTimeout(timeSetter, 500);

function startBot() {
  const config = { childList: true, subtree: true };
  const config2 = { subtree: true, characterData: true, childList: true };

  dealsListObserver.observe(dealsList, config);
  profitBlockObserver.observe(profitBlock, config2);
  makeDecision();
}

function restartBot() {
  currentCount = smallBets[0];
  setValueInput(valueInput, currentCount);

  const config = { childList: true, subtree: true };
  const config2 = { subtree: true, characterData: true, childList: true };

  dealsListObserver.observe(dealsList, config);
  profitBlockObserver.observe(profitBlock, config2);
  makeDecision();
}

function stopBot() {
  dealsListObserver.disconnect();
  profitBlockObserver.disconnect();
  console.log("Bot stopped");
}

if (profitPercent >= 92) {
  if (!hotKeysOn) {
    openHotKeysWindow();
    setTimeout(clickHotKeysButton, 300);
  }
  if (currentSymbol.includes("OTC")) {
    setTimeout(startBot, 2000);
  } else {
    alert(
      "The bot is not running. Current symbol is not OTC, please refresh the page",
    );
  }
} else {
  alert(
    "The bot is not running. Profit below 92% (=" +
      profitPercent +
      "%), please refresh the page",
  );
}
