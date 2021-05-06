# Publishing Releases

We are using <https://www.electron.build/> to publish releases.

## Versioning

We have to update two `versions` in two `package.json`s.
We have a helper script so run the following commands.

New pre-release of new minor version:

```bash
yarn run version:preminor
```

In the default yarn versioning, there are no alpha or beta releases.
Only prereleases, such as `v0.1.0-12`.

## Channels

Unfortunatly, electron builder considers the pre-version suffix `-12` as an own channel.
So we specify channel in the `package.json` to ensure that there is only one channel.

```json
  "channel": "latest"
```

## Deployment via GitHub Actions (CI)

Set the following repository secrets for GitHub Actions:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `READ_PACKAGES_TOKEN`: GitHub token with scope to read packages
- `SENTRY_DSN`
- `UPDATE_FEED_URL`: custom location (if required) for the auto-update feed

### S3-Compliant API

We are using [OVH public cloud object storage](https://www.ovhcloud.com/en/public-cloud/object-storage/) as a S3 alternative.

To make this work:

1. create a public bucket e.g. `bucketname`
2. create another public bucket e.g. `bucketname+segments`. (This is needed because otherwise, this bucket will be created automatcally when uploading the first releases. But this bucket is then private, so the releases cannot be distributed publicly. I didn't test it, but you can most likely change the permissions of the bucket via the Swift CLI.)
3. Set the ENV `UPDATE_FEED_URL` to the public location of the bucket (for auto-updating).

<https://www.electron.build/configuration/publish#s3options>

### GitHub

Using GitHub's releases feature, adapt the outer `package.json`.

```json
  "publish": {
    "provider": "github",
    "owner": "algorithmwatch",
    "repo": "dataskop-electron"
  }
```

### macOS

For macOS: zip as build target is required to make auto-update work: https://github.com/electron-userland/electron-builder/issues/2199

In addition to make auto update work, you need to get developer certificates from Apple, and set appropriate ENV varibales in GitHub actions.

Guides:

- https://codycallahan.com/blog/deploying-electron-with-github-actions-macos
- https://www.electron.build/code-signing