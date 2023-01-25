import {
  app,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from "electron";

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.DEBUG_PROD === "true"
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === "darwin"
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on("context-menu", (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: "Electron",
      submenu: [
        {
          label: "Über DataSkop",
          selector: "orderFrontStandardAboutPanel:",
        },
        { type: "separator" },
        // { label: "Services", submenu: [] },
        { type: "separator" },
        {
          label: "DataSkop ausblenden",
          accelerator: "Command+H",
          selector: "hide:",
        },
        {
          label: "Andere ausblenden",
          accelerator: "Command+Shift+H",
          selector: "hideOtherApplications:",
        },
        { label: "Alle einblenden", selector: "unhideAllApplications:" },
        { type: "separator" },
        {
          label: "Beenden",
          accelerator: "Command+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    };
    // The copy & paste commands are important to be able to e.g. paste the password.
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: "Bearbeiten",
      submenu: [
        { label: "Ausschneiden", accelerator: "Command+X", selector: "cut:" },
        { label: "Kopieren", accelerator: "Command+C", selector: "copy:" },
        { label: "Einfügen", accelerator: "Command+V", selector: "paste:" },
        {
          label: "Alles auswählen",
          accelerator: "Command+A",
          selector: "selectAll:",
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "Command+R",
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: "Toggle Full Screen",
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "Alt+Command+I",
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: "Darstellung",
      submenu: [
        {
          label: "Vollbildmodus",
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: "Fenster",
      submenu: [
        {
          label: "Minimieren",
          accelerator: "Command+M",
          selector: "performMiniaturize:",
        },
        {
          label: "Schließen",
          accelerator: "Command+W",
          selector: "performClose:",
        },
        { type: "separator" },
        { label: "Alle nach vorne bringen", selector: "arrangeInFront:" },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: "Hilfe",
      submenu: [
        {
          label: "Unsere Webseite",
          click() {
            shell.openExternal("https://dataskop.net");
          },
        },
        {
          label: "FAQ",
          click() {
            shell.openExternal("https://dataskop.net/faq/");
          },
        },
        {
          label: "Technischen Support",
          click() {
            shell.openExternal("https://dataskop.net/kontakt/");
          },
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === "development" ||
      process.env.DEBUG_PROD === "true"
        ? subMenuViewDev
        : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  // This menu currently doesn't get used. If you want to add a menu for win/linux
  // change it here.
  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: "&File",
        submenu: [
          {
            label: "&Open",
            accelerator: "Ctrl+O",
          },
          {
            label: "&Close",
            accelerator: "Ctrl+W",
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: "&View",
        submenu:
          process.env.NODE_ENV === "development" ||
          process.env.DEBUG_PROD === "true"
            ? [
                {
                  label: "&Reload",
                  accelerator: "Ctrl+R",
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: "Toggle &Full Screen",
                  accelerator: "F11",
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen(),
                    );
                  },
                },
                {
                  label: "Toggle &Developer Tools",
                  accelerator: "Alt+Ctrl+I",
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                  },
                },
              ]
            : [
                {
                  label: "Toggle &Full Screen",
                  accelerator: "F11",
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen(),
                    );
                  },
                },
              ],
      },
      {
        label: "Help",
        submenu: [
          {
            label: "Learn More",
            click() {
              shell.openExternal("https://electronjs.org");
            },
          },
          {
            label: "Documentation",
            click() {
              shell.openExternal(
                "https://github.com/electron/electron/tree/main/docs#readme",
              );
            },
          },
          {
            label: "Community Discussions",
            click() {
              shell.openExternal("https://www.electronjs.org/community");
            },
          },
          {
            label: "Search Issues",
            click() {
              shell.openExternal("https://github.com/electron/electron/issues");
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}

export const buildMenu = (mainWindow: BrowserWindow) => {
  // Only show OS menu on MacOS
  if (process.platform === "darwin") {
    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();
  } else {
    // Hide Menu on Windows & Linux
    Menu.setApplicationMenu(null);
  }
};
