'use strict';
(function exportModule(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.loot = root.loot || {};
    root.loot.DOM = factory(root.marked);
  }
}(this, (marked) => {
  function getElementInTableRowTemplate(rowTemplateId, elementClass) {
    const select = document.querySelector('link[rel="import"][href$="editable-table.html"]');
    if (select) {
      return select.import.querySelector(`#${rowTemplateId}`).content
        .querySelector(`.${elementClass}`);
    }
    return document.querySelector(`#${rowTemplateId}`).content.querySelector(`.${elementClass}`);
  }

  function createGameItem(game) {
    const menuItem = document.createElement('paper-item');
    menuItem.setAttribute('value', game.folder);
    menuItem.textContent = game.name;

    return menuItem;
  }

  function createLanguageItem(language) {
    const item = document.createElement('paper-item');
    item.setAttribute('value', language.locale);
    item.textContent = language.name;

    return item;
  }

  function createMessageItem(message) {
    const li = document.createElement('li');
    li.className = 'error';
    /* Use the Marked library for Markdown formatting support. */
    li.innerHTML = marked(message);

    return li;
  }

  function createGameTypeItem(gameType) {
    const item = document.createElement('paper-item');
    item.setAttribute('value', gameType);
    item.textContent = gameType;

    return item;
  }

  function forceSelectDefaultValue(element) {
    element.setAttribute('value', element.firstElementChild.getAttribute('value'));
  }

  return class DOM {
    static show(elementId, showElement = true) {
      document.getElementById(elementId).hidden = !showElement;
    }

    static enable(elementOrId, enableElement = true) {
      let element = elementOrId;
      if (typeof element === 'string' || element instanceof String) {
        element = document.getElementById(element);
      }

      if (enableElement) {
        element.removeAttribute('disabled');
      } else {
        element.setAttribute('disabled', '');
      }
    }

    static openDialog(dialogElementId) {
      document.getElementById(dialogElementId).open();
    }

    static updateSelectedGame(gameFolder) {
      document.getElementById('gameMenu').value = gameFolder;

      /* Also disable deletion of the game's row in the settings dialog. */
      const table = document.getElementById('gameTable');
      for (let i = 0; i < table.tBodies[0].rows.length; ++i) {
        const folderElements = table.tBodies[0].rows[i].getElementsByClassName('folder');
        if (folderElements.length === 1) {
          table.setReadOnly(table.tBodies[0].rows[i],
                            ['delete'],
                            folderElements[0].value === gameFolder);
        }
      }
    }

    static updateEnabledGames(installedGames) {
      const gameMenuItems = document.getElementById('gameMenu').children;
      for (let i = 0; i < gameMenuItems.length; ++i) {
        DOM.enable(gameMenuItems[i],
                   installedGames.indexOf(gameMenuItems[i].getAttribute('value')) !== -1);
      }
    }

    static setGameMenuItems(games) {
      const gameMenu = document.getElementById('gameMenu');

      /* First make sure game listing elements don't have any existing entries. */
      while (gameMenu.firstElementChild) {
        gameMenu.removeChild(gameMenu.firstElementChild);
      }

      games.forEach((game) => {
        gameMenu.appendChild(createGameItem(game));
      });
    }

    static updateSettingsDialog(settings) {
      const gameSelect = document.getElementById('defaultGameSelect');
      const gameTable = document.getElementById('gameTable');

      /* First make sure game listing elements don't have any existing entries. */
      while (gameSelect.children.length > 1) {
        gameSelect.removeChild(gameSelect.lastElementChild);
      }
      gameTable.clear();

      /* Now fill with new values. */
      settings.games.forEach((game) => {
        gameSelect.appendChild(createGameItem(game));

        const row = gameTable.addRow(game);
        gameTable.setReadOnly(row, ['name', 'folder', 'type']);
      });

      gameSelect.value = settings.game;
      document.getElementById('languageSelect').value = settings.language;
      document.getElementById('enableDebugLogging').checked = settings.enableDebugLogging;
      document.getElementById('updateMasterlist').checked = settings.updateMasterlist;
    }

    static fillGameTypesList(gameTypes) {
      const select = getElementInTableRowTemplate('gameRow', 'type');

      gameTypes.forEach((gameType) => {
        select.appendChild(createGameTypeItem(gameType));
      });

      forceSelectDefaultValue(select);
      select.setAttribute('value', select.firstElementChild.getAttribute('value'));
    }

    static fillLanguagesList(languages) {
      const settingsLangSelect = document.getElementById('languageSelect');
      const messageLangSelect = getElementInTableRowTemplate('messageRow', 'language');

      languages.forEach((language) => {
        const settingsItem = createLanguageItem(language);
        settingsLangSelect.appendChild(settingsItem);
        messageLangSelect.appendChild(settingsItem.cloneNode(true));
      });

      forceSelectDefaultValue(messageLangSelect);
    }

    static listInitErrors(errorMessages) {
      if (!errorMessages) {
        return;
      }
      const generalMessagesList = document.getElementById('summary').getElementsByTagName('ul')[0];

      errorMessages.forEach((message) => {
        generalMessagesList.appendChild(createMessageItem(message));
      });

      document.getElementById('filterTotalMessageNo').textContent = errorMessages.length;
      document.getElementById('totalMessageNo').textContent = errorMessages.length;
      document.getElementById('totalErrorNo').textContent = errorMessages.length;
    }

    static setVersion(version) {
      document.getElementById('LOOTVersion').textContent = version.release;
      document.getElementById('firstTimeLootVersion').textContent = version.release;
      document.getElementById('LOOTBuild').textContent = version.build;
    }

    static initialiseAutocompleteFilenames(filenames) {
      getElementInTableRowTemplate('fileRow', 'name').setAttribute('source', JSON.stringify(filenames));
    }

    static initialiseAutocompleteBashTags(tags) {
      getElementInTableRowTemplate('tagRow', 'name').setAttribute('source', JSON.stringify(tags));
    }
  };
}));
