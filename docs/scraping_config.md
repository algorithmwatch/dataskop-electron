# Configure the scraping

We introduce a special JSON-format to configure the scraping behaviour of this Electron app.

The JSON schema is derived fromt th TypeScripy definition with <https://github.com/vega/ts-json-schema-generator>.

To generate the schemas, run `npm run schema`.
You need to run it when the types are adapted.
The schema files are location in `src/renderer/lib/validation`.

For now, we only validate YouTube config files.
