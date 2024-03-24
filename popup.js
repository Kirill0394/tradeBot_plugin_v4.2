const script = document.createElement("script");
script.src = "botCode.js";
document.head.appendChild(script);

let isInit = false;

// Функция для добавления слушателей событий к инпутам
function addInputListeners() {
  // Получаем ссылки на все инпуты
  const defaultValueInput = document.getElementById("defaultValue");
  const maxBetValueInput = document.getElementById("maxBetValue");
  const smallBetsInput = document.getElementById("smallBets");
  const bigBetsInput = document.getElementById("bigBets");

  // Добавляем слушатели событий для каждого инпута
  defaultValueInput.addEventListener("input", handleInputChange);
  maxBetValueInput.addEventListener("input", handleInputChange);
  smallBetsInput.addEventListener("input", handleInputChange);
  bigBetsInput.addEventListener("input", handleInputChange);
}

// Функция обработчика события изменения значения в инпуте
function handleInputChange(event) {
  const inputId = event.target.id;
  const inputValue = event.target.value;

  // Обрабатываем изменения в зависимости от id инпута
  switch (inputId) {
    default:
      saveValuesToLocalStorage();
      break;
  }
}

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
  // Вызываем функцию добавления слушателей к инпутам при загрузке документа
  addInputListeners();

  let inputIds = ["defaultValue", "maxBetValue"];

  inputIds.forEach(function (inputId) {
    const inputElement = document.getElementById(inputId);
    inputElement.addEventListener("input", function (event) {
      const inputValue = event.target.value;
      if (inputValue === "") {
        return;
      }
      const regex = /^[0-9.]*$/;
      if (!regex.test(inputValue)) {
        event.target.value = inputValue.slice(0, -1);
      }
    });
    inputElement.addEventListener("paste", function (event) {
      // Получаем вставляемый текст из буфера обмена
      const pastedText = (event.clipboardData || window.clipboardData).getData(
        "text",
      );

      // Проверяем, содержит ли вставленный текст запрещенные символы
      const regex = /^[0-9.]*$/;
      if (!regex.test(pastedText)) {
        // Отменяем операцию вставки
        event.preventDefault();
      }
    });
  });

  inputIds = ["smallBets", "bigBets"];

  inputIds.forEach(function (inputId) {
    const inputElement = document.getElementById(inputId);
    inputElement.addEventListener("input", function (event) {
      const inputValue = event.target.value;
      if (inputValue === "") {
        return;
      }
      const regex = /^[0-9., ]*$/;
      if (!regex.test(inputValue)) {
        event.target.value = inputValue.slice(0, -1);
      }
    });
    inputElement.addEventListener("paste", function (event) {
      // Получаем вставляемый текст из буфера обмена
      const pastedText = (event.clipboardData || window.clipboardData).getData(
        "text",
      );

      // Проверяем, содержит ли вставленный текст запрещенные символы
      const regex = /^[0-9., ]*$/;
      if (!regex.test(pastedText)) {
        // Отменяем операцию вставки
        event.preventDefault();
      }
    });
  });

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

    const startBotButton = document.getElementById("startBot");
    const stopBotButton = document.getElementById("stopBot");
    if (data.isBotRunning) {
      startBotButton.style.display = "none";
      stopBotButton.style.display = "block";
    } else {
      startBotButton.style.display = "block";
      stopBotButton.style.display = "none";
    }
  });

  // Обработчик события для кнопки "Start Bot"
  const startBotButton = document.getElementById("startBot");
  const stopBotButton = document.getElementById("stopBot");

  // Получаем значение DEFAULT_START из поля ввода
  const defaultValueInput = document.getElementById("defaultValue");
  let canStart;

  if (startBotButton) {
    startBotButton.addEventListener("click", function () {
      let defaultValue = document.getElementById("defaultValue").value;
      let maxBetValue = document.getElementById("maxBetValue").value;
      let smallBetsValue = document.getElementById("smallBets").value;
      let bigBetsValue = document.getElementById("bigBets").value;

      // Проверяем, содержат ли значения инпутов только цифры и разделители
      const regex = /^[0-9.]+$/;
      if (!regex.test(defaultValue) || !regex.test(maxBetValue)) {
        canStart = false;
        alert("Please enter valid numbers in all input fields.");
        return;
      } else {
        canStart = true;
      }

      const regex1 = /^[0-9., ]+$/;
      if (!regex1.test(smallBetsValue) || !regex1.test(bigBetsValue)) {
        canStart = false;
        alert("Please enter valid numbers in all input fields.");
        return;
      } else {
        canStart = true;
      }

      // Проверяем, что значения инпутов заканчиваются цифрой
      if (
        !/^[0-9]$/.test(defaultValue.slice(-1)) ||
        !/^[0-9]$/.test(maxBetValue.slice(-1)) ||
        !/^[0-9]$/.test(smallBetsValue.slice(-1)) ||
        !/^[0-9]$/.test(bigBetsValue.slice(-1))
      ) {
        canStart = false;
        alert("Values in input fields must end with a number.");
        return;
      } else {
        canStart = true;
      }

      // Проверяем, что значения инпутов начинаются цифрой
      if (
        !/^[0-9]$/.test(defaultValue.slice(0)) ||
        !/^[0-9]$/.test(maxBetValue.slice(0)) ||
        !/^[0-9]$/.test(smallBetsValue.slice(0)) ||
        !/^[0-9]$/.test(bigBetsValue.slice(0))
      ) {
        canStart = false;
        alert("Values in input fields must start with a number.");
        return;
      } else {
        canStart = true;
      }

      if (canStart) {
        // Вставляем и выполняем код в консоли
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            // Получаем активную вкладку
            let activeTab = tabs[0];
            let params;
            // Формируем код для выполнения в консоли
            if (!isInit) {
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
              }
            });
          },
        );
        startBotButton.style.display = "none";
        stopBotButton.style.display = "block";

        saveBotState(true); // Сохраняем состояние бота как запущенный
        saveValuesToLocalStorage();
      }
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
