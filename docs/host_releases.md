# Host Releases

Different configuration to publish and distribute the app releases.

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
