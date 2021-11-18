# Backend

The Django-based backend is located in another repository [dataskop-platform](https://github.com/algorithmwatch/dataskop-platform).

## API

The api endpoints are protected via Basic Authentication to prevent script kiddies from posting random data.
To make CORS work, you have to exempt OPTION requests from basic auth.
Fetch (in the renderer process) creates a preflight requests which cannot contain the basic auth credentials.

- <https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request>
- <https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials>

It's not possible to use fetch in the `no-cors` mode because the auth headers cannot be added: <https://stackoverflow.com/a/42377983/4028896>
