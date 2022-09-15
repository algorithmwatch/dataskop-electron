# Publishing releases

We are using <https://www.electron.build/> to publish releases via Github Actions.

## Versioning

We have to update two `versions` in two `package.json`s.
We have a helper script so run the following commands.

**IMPORTANT**: You need to have clean git status (no unstaged changes etc.).

### Alpha release

New alpha release:

```bash
npm run version:alpha:pre
npm run version:alpha:preminor
npm run version:alpha:prepath
```

### Beta release

New beta release:

```bash
npm run version:beta:pre
npm run version:beta:preminor
npm run version:beta:prepath
```

### Production release

To release a new patch for a production version:

```bash
npm run version:patch
npm run version:minor
```

## Publishing releases via GitHub Actions

### Secrets

Set the following repository secrets for GitHub Actions:

```
APPLE_ID                    macOS
APPLE_ID_PASS
CSC_KEY_PASSWORD
CSC_LINK

WIN_CSC_KEY_PASSWORD        Windows
WIN_CSC_LINK

AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
UPDATE_FEED_URL             Custom URL to make auto-update work
INTERNAL_BUCKET             Bucket name for internal releases
INTERNAL_UPDATE_FEED_URL

PLATFORM_URL                Backend URL
SERIOUS_PROTECTION          Password for Basic Auth
BETA_PLATFORM_URL
BETA_SERIOUS_PROTECTION

FONT_AWESOME_TOKEN          Token for Font Awesome Pro
READ_PACKAGES_TOKEN         GitHub token with scope to read packages

SENTRY_DSN                  Sentry
TRACK_EVENTS                Send some events to our backend
KEYBASE_WEBHOOK             Send a notification for successful releases to a Keybase channel via the Keybase webhookbot
```

### S3-Compliant Object Storage

We're using [OVH public cloud object storage](https://www.ovhcloud.com/en/public-cloud/object-storage/) as a S3 alternative.

1. Create a public bucket e.g. `bucketname`
2. Create another public bucket e.g. `bucketname+segments`. (This is needed because otherwise, this bucket will be created automatcally when uploading the first releases. But this bucket is then private, so the releases cannot be distributed publicly. You could also use the swift CLI to to make the bucket public.)
3. Set the GHA secret `UPDATE_FEED_URL` to the public location of the bucket (for auto-updating): `https://storage.de.cloud.ovh.net/v1/AUTH_string/bucketname`

### macOS certificate

In addition to make auto update work, you need to get developer certificates from Apple, and set appropriate secrets in GitHub actions.

NB: zip as build target is required to make auto-update work: https://github.com/electron-userland/electron-builder/issues/2199

Guides:

- https://codycallahan.com/blog/deploying-electron-with-github-actions-macos
- https://www.electron.build/code-signing

### Windows certificate

1. Get a Windows Code Signing Certificate
2. Export the cert with private key and password
3. Encode cert as base64 (<https://www.electron.build/code-signing.html#travis-appveyor-and-other-ci-servers>) and set it as `WIN_CSC_LINK`.
4. Set the password in `WIN_CSC_KEY_PASSWORD`.
