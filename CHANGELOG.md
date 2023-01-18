# Changelog

## [unreleased] - 2023-01-xx

- Fixed a bug where the list of last stati was no updated on status change
- Windows only: Fixed the annoying bug that created a modal with "can't open bytedance url".

## [v0.5.0-alpha.26] - 2023-01-17

- Fixed a bug that resulted in an unnecessary error modal
- Status texts in the tray are now translated to German

## [v0.5.0-alpha.25] - 2023-01-13

- Added a progress bar (with estimated time of completion)
- Survey was changed

## [v0.5.0-alpha.24] - 2023-01-10

- Fixed an error when building for macOS on CI

## [v0.5.0-alpha.23] - 2023-01-10

Thanks to all the testers for their feedback.
With this release, we mostly fixed bugs but also added some small features.
We highlight some changes and bug fixes.

Changes:

- When the app crashes, the user gets informed via a modal with an error description (no more blank screen). The user can report the error by sending an email to us.
- You can turn off the auto-start via the tray.
- Translated & improved the macOS Menu bar
- Removed the unnecessary menubar on Windows & Linux
- Improve the status text when a user imports a dump
- Added a progress bar to the survey

Bug fixes:

- Fixed "copy & paste" on macOS
- Fixed various bugs regarding the tray (task bar)
- Fixed a bug that re-positioned the window to the initial position
- Fixed a bug where the auto-update was initiated in the wrong situations (and possibly broke the auto-update process)
- Fixed negative values in viz1
- Fixed image export for viz1
- Fixed a bug with crashing viz3 when a user didn't have any favorite videos

## [v0.5.0-alpha.22] - 2022-12-15

- We fixed a bug with downloading the ready dump from TikTok. Please update asap if you have requested your GDPR dump.
- We make the app work on smaller screens.
- We reduced the number of videos a user has to scrape from 1000 to 500. This should give results faster. If you want to visualize 1000 videos. You have to import the data again.

## [v0.5.0-alpha.21] - 2022-12-13

- Tray: We show in the tray information about the most recent status update.
- macOS only: We fixed a bug where the status of a GDPR request not be checked.

## [v0.5.0-alpha.20] - 2022-12-13

- We changed how auto-updating works. For the next update, the update screen will look strange, but this is fixed for future updates. However, we're unsure if the new way how updates are delivered actually works (so you may need to download the app again. We will let you know). Maybe you cannot even update to the new version. Please contact us in this case.
- The three visualizations on the first visualization page were showing incorrect numbers. We fixed it.
- The survey was changed and placeholders were filled. Please let us know how you feel about the questions.
- On the waiting page, the last status change is displayed. If you click on it, you can to a list of all status changes.
- We fixed several other minor bugs and improved performance of the app.

## [v0.5.0-alpha.19] - 2022-12-08

- The first internal alpha release to test the next version DataSkop for TikTok.
