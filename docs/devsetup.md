## Recommended Setup for Development

We are using [TypeScript](https://www.typescriptlang.org/) to add typing to JavaScript.
But you don't have to install it manually (it will get insteed alongside all the other dependencies).

Install [VS Code](https://code.visualstudio.com/) and also the following extensions:

- https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig
- https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
- https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

VS Code will automatically format the code and manage imports when you save a file.
You can tips on how what's wrong with your code via TypeScript or ESLint.

Optional Extensions:

- https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens
- https://marketplace.visualstudio.com/items?itemName=sleistner.vscode-fileutils

## Tips & Comments

When using Cherio, pay attention to the different returned types.
Array with cheerio are not ordinary arrays.
Check out [this answer on SO](https://stackoverflow.com/a/41028856/4028896).
