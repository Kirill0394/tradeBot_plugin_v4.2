const script = document.createElement("script");
script.src = "botCode.js";
document.head.appendChild(script);

let isInit = false;

// Функция для сохранения состояния бота в локальном хранилище
function saveBotState(isBotRunning) {
  chrome.storage.local.set({ isBotRunning });
}

document.addEventListener("DOMContentLoaded", function () {
  // Функция для загрузки состояния бота из локального хранилища
  function loadBotState(callback) {
    chrome.storage.local.get("isBotRunning", function (data) {
      callback(data.isBotRunning);
    });
  }

  // Обновляем кнопки в соответствии с состоянием бота
  function updateButtons(isBotRunning) {
    const startBotButton = document.getElementById("startBot");
    const stopBotButton = document.getElementById("stopBot");

    if (isBotRunning) {
      startBotButton.style.display = "none";
      stopBotButton.style.display = "block";
    } else {
      startBotButton.style.display = "block";
      stopBotButton.style.display = "none";
    }
  }

  // Загружаем состояние бота и обновляем кнопки
  loadBotState(function (isBotRunning) {
    updateButtons(isBotRunning);
  });

  // Обработчик события для кнопки "Start Bot"
  const startBotButton = document.getElementById("startBot");
  const stopBotButton = document.getElementById("stopBot");
  let defaultValue;
  if (startBotButton) {
    startBotButton.addEventListener("click", function () {
      // Получаем значение DEFAULT_START из поля ввода
      const defaultValueInput = document.getElementById("defaultValue");
      defaultValue = defaultValueInput.value;

      // Вставляем и выполняем код в консоли
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Получаем активную вкладку
        let activeTab = tabs[0];
        let params;
        // Формируем код для выполнения в консоли
        if (!isInit) {
          params = {
            code: `
                            let DEFAULT_START = ${JSON.stringify(defaultValue)};
                            ${isInit ? botCode.restartBot : botCode.startBot}
                        `,
          };
        } else {
          params = {
            code: `
                            DEFAULT_START = ${JSON.stringify(defaultValue)};
                            smallBets = multiplyArray([1, 1]);
                            bigBets = multiplyArray([4, 11, 25, 55, 120, 250]);
                            ${isInit ? botCode.restartBot : botCode.startBot}
                        `,
          };
        }

        // Вставляем и выполняем код из botCode.js в консоли
        chrome.tabs.executeScript(activeTab.id, params, function (result) {
          if (chrome.runtime.lastError) {
            console.error(
              "Ошибка в выполнении скрипта:",
              chrome.runtime.lastError,
            );
          } else {
            console.log("Код успешно выполнен:", result);
            isInit = true;
            saveBotState(true); // Сохраняем состояние бота как запущенный
            updateButtons(true); // Обновляем кнопки
          }
        });
      });
    });
  } else {
    console.error('Элемент с id "startBot" не найден.');
  }

  // Обработчик события для кнопки "Stop Bot"
  if (stopBotButton) {
    stopBotButton.addEventListener("click", function () {
      // Вставляем и выполняем код в консоли
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Получаем активную вкладку
        let activeTab = tabs[0];

        // Вставляем и выполняем код из botCode.js в консоли
        chrome.tabs.executeScript(
          activeTab.id,
          { code: botCode.stopBot },
          function (result) {
            if (chrome.runtime.lastError) {
              console.error(
                "Ошибка в выполнении скрипта:",
                chrome.runtime.lastError,
              );
            } else {
              console.log("Код успешно выполнен:", result);
              alert("The bot is stopped");
              saveBotState(false); // Сохраняем состояние бота как остановленный
              updateButtons(false); // Обновляем кнопки
            }
          },
        );
      });
    });
  } else {
    console.error('Элемент с id "stopBot" не найден.');
  }

  // Обработчик события для кнопки "Set Bet"
  const setBetButton = document.getElementById("setBetButton");
  const betInputContainer = document.getElementById("betInputContainer");
  const defaultValueInput = document.getElementById("defaultValue");

  setBetButton.addEventListener("click", function () {
    if (betInputContainer.style.display === "none") {
      betInputContainer.style.display = "block";
      defaultValueInput.focus(); // Переместить фокус на инпут
    } else {
      betInputContainer.style.display = "none";
    }
  });
});
hehe;
