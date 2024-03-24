const script = document.createElement("script");
script.src = "botCode.js";
document.head.appendChild(script);

let isInit = false;

// Функция для сохранения значений инпутов и состояния кнопок в локальном хранилище
function saveValuesToLocalStorage() {
  const defaultValue = document.getElementById("defaultValue").value;
  const maxBetValue = document.getElementById("maxBetValue").value;
  const smallBetsValue = document.getElementById("smallBets").value;
  const bigBetsValue = document.getElementById("bigBets").value;
  const isBotRunning =
    document.getElementById("stopBot").style.display === "block";

  chrome.storage.local.set({
    defaultValue,
    maxBetValue,
    smallBetsValue,
    bigBetsValue,
    isBotRunning,
  });
}

// Функция для сохранения состояния бота в локальном хранилище
function saveBotState(isBotRunning) {
  chrome.storage.local.set({ isBotRunning });
}

document.addEventListener("DOMContentLoaded", function () {
  // Функция для загрузки состояния бота из локального хранилища
  function loadValuesFromLocalStorage(callback) {
    chrome.storage.local.get(
      [
        "defaultValue",
        "maxBetValue",
        "smallBetsValue",
        "bigBetsValue",
        "isBotRunning",
      ],
      function (data) {
        callback(data);
      },
    );
  }

  // Обновление значений инпутов и состояния кнопок из локального хранилища
  loadValuesFromLocalStorage(function (data) {
    if (Object.keys(data).length === 0 && data.constructor === Object) {
      // Если данные отсутствуют, устанавливаем значения по умолчанию
      document.getElementById("defaultValue").value = "1";
      document.getElementById("maxBetValue").value = "250";
      document.getElementById("smallBets").value = "1, 1";
      document.getElementById("bigBets").value = "4, 11, 25, 55, 120, 250";
    } else {
      // Если данные загружены из хранилища, устанавливаем их в инпуты
      document.getElementById("defaultValue").value = data.defaultValue || "";
      document.getElementById("maxBetValue").value = data.maxBetValue || "";
      document.getElementById("smallBets").value = data.smallBetsValue || "";
      document.getElementById("bigBets").value = data.bigBetsValue || "";
    }
  });

  // Обработчик события для кнопки "Start Bot"
  const startBotButton = document.getElementById("startBot");
  const stopBotButton = document.getElementById("stopBot");
  let defaultValue;

  let maxBetValue;

  let smallBetsValue;

  let bigBetsValue;

  // Получаем значение DEFAULT_START из поля ввода
  const defaultValueInput = document.getElementById("defaultValue");
  defaultValue = defaultValueInput.value;
  const maxBetValueInput = document.getElementById("maxBetValue");
  maxBetValue = maxBetValueInput.value;
  const smallBetsValueInput = document.getElementById("smallBets");
  smallBetsValue = smallBetsValueInput.value;
  const bigBetsValueInput = document.getElementById("bigBets");
  bigBetsValue = bigBetsValueInput.value;

  if (startBotButton) {
    startBotButton.addEventListener("click", function () {
      // Вставляем и выполняем код в консоли
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Получаем активную вкладку
        let activeTab = tabs[0];
        let params;
        // Формируем код для выполнения в консоли
        if (!isInit) {
          if (
            parseFloat(maxBetValue) >
            parseFloat(bigBetsValue[bigBetsValue.length - 1])
          ) {
            maxBetValue = bigBetsValue[bigBetsValue.length - 1];
          }
          params = {
            code: `
                            let DEFAULT_START = ${JSON.stringify(defaultValue)};
                            let maxBet = ${JSON.stringify(maxBetValue)};
                            
                            let array = JSON.parse(\`${JSON.stringify(smallBetsValue)}\`);
                            let array1;
                            
                            if (array.includes(",")) {
                              array1 = floatArray = array.split(", ").map(function(item) {
                                  return parseFloat(item);
                              });
                            } else {
                              array1 = floatArray = array.split("").map(function(item) {
                                  return parseFloat(item);
                              });    
                            }  
                            
                            let smallBets = array1.map(x => x * DEFAULT_START);
                            
                            array = JSON.parse(\`${JSON.stringify(bigBetsValue)}\`);
                            
                            if (array.includes(",")) {
                              array1 = floatArray = array.split(", ").map(function(item) {
                                  return parseFloat(item);
                              });
                            } else {
                              array1 = floatArray = array.split("").map(function(item) {
                                  return parseFloat(item);
                              });    
                            } 
                            
                            let bigBets = array1.map(x => x * DEFAULT_START);
                            
                            ${isInit ? botCode.restartBot : botCode.startBot}
                        `,
          };
        } else {
          params = {
            code: `
                            DEFAULT_START = ${JSON.stringify(defaultValue)};
                            maxBet = ${JSON.stringify(maxBetValue)};
                            
                            array = JSON.parse(\`${JSON.stringify(smallBetsValue)}\`);
                            
                            if (array.includes(",")) {
                              array1 = floatArray = array.split(", ").map(function(item) {
                                  return parseFloat(item);
                              });
                            } else {
                              array1 = floatArray = array.split("").map(function(item) {
                                  return parseFloat(item);
                              });    
                            } 
                            
                            smallBets = array1.map(x => x * DEFAULT_START);
                            
                            array = JSON.parse(\`${JSON.stringify(bigBetsValue)}\`);
                            
                            if (array.includes(",")) {
                              array1 = floatArray = array.split(", ").map(function(item) {
                                  return parseFloat(item);
                              });
                            } else {
                              array1 = floatArray = array.split("").map(function(item) {
                                  return parseFloat(item);
                              });    
                            } 
                            
                            bigBets = array1.map(x => x * DEFAULT_START);
                            
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
      startBotButton.style.display = "none";
      stopBotButton.style.display = "block";

      saveBotState(true); // Сохраняем состояние бота как запущенный
      saveValuesToLocalStorage();
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
      stopBotButton.style.display = "none";
      startBotButton.style.display = "block";

      saveBotState(false); // Сохраняем состояние бота как остановленный
      saveValuesToLocalStorage();
    });
  } else {
    console.error('Элемент с id "stopBot" не найден.');
  }

  // Обработчик события для кнопки "Set Bet"
  const setBetButton = document.getElementById("setBetButton");
  const betInputContainer = document.getElementById("betInputContainer");

  setBetButton.addEventListener("click", function () {
    if (betInputContainer.style.display === "none") {
      betInputContainer.style.display = "block";
      defaultValueInput.focus(); // Переместить фокус на инпут
    } else {
      betInputContainer.style.display = "none";
    }
  });
});
