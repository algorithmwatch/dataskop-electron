# How to update the YouTube Scraper (harke)

1. Work on <https://github.com/algorithmwatch/harke> and fix the broken scraper.
2. Tag a new harke version: `yarn version --patch`
3. Publish a new harke version: `git push --follow-tags`
4. Update harke in this repo: `npm i @algorithmwatch/harke@latest`
5. Publish a new version of the Electron app: `npm run version:patch`
6. Check if the new builds get released successfully: <https://github.com/algorithmwatch/dataskop-electron/actions/workflows/publish.yml>
