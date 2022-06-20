# Concept, Software Design Decisions, Software Architecture

## Package everything

All code gets packaged with the app, no code gets loaded remotely.
While this is possibile it's discouraged (because it may lead to security issues).
We may have to change this if the parser for a provider needs to get updated very often.
But genereally, we could also publish a new release every time a parser update is required.

## Only TypeScript

Write only TypeScript (or JavaScript) to keep it simple, do not try to include Python or other stuff.
Even thought there are more sophisticated Python packages for scraping, [cheerio](https://github.com/cheeriojs/cheerio) is fine.
Try not to use any kind of native module.
