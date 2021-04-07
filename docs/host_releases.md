# Host Releases

Different configuration to publish and distribute the app releases.

## Deployment via GitHub Actions (CI)

Set the following repository secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `READ_PACKAGES_TOKEN`: GitHub token with scope to read packages
- `SENTRY_DSN`
- `UPDATE_FEED_URL`: custom location (if required) for the auto-update feed

## Versioning

New pre-release of new minor version:

```bash
yarn run version:preminor
```

In the default yarn versioning, there are no alpha or beta releases.
Only prereleases, such as v0.1.0-12.
Unfortunatly, electron builder considers the suffix `-12` as an own channel.
So we specify channel in the `package.json` to ensure that there are only.

```json
  "channel": "latest"
```

We maybe need to have seperate channels for beta and alpha releases later on.

### S3-Compliant API

e.g. OVH public cloud object storage

<https://www.electron.build/configuration/publish#s3options>

### GitHub

Using GitHub's releases feature, adapth the outer `package.json`.

```json
  "publish": {
    "provider": "github",
    "owner": "algorithmwatch",
    "repo": "dataskop-electron"
  }
```

### Notes

For macOS: zip required to make auto-update work: https://github.com/electron-userland/electron-builder/issues/2199
