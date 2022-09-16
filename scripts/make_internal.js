const fs = require("fs");
const process = require("process");

const args = process.argv.slice(2);

const text = fs.readFileSync("./package.json", "utf-8");
const fixed = text
  .replace('"bucket": "dataskop"', `"bucket": "${args[0]}"`)
  .replace('"productName": "DataSkop"', '"productName": "DataSkop Internal"')
  .replace(
    '"appId": "org.algorithmwatch.DataSkop"',
    '"appId": "org.algorithmwatch.dataskopinternal"',
  );

fs.writeFileSync("./package.json", fixed, "utf-8");
