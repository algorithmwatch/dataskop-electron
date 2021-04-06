# Host Releases

Different configuration to publish and distribute the app releases.

## Versioning

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
