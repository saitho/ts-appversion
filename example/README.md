# SampleApp

This is an example Angular app showcasing the usage of ts-appversion.
Note that ts-appversion is in no way bound to Angular. Feel free to use it with any other TypeScript-based framework.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.9.

## Environments

Based on the environment different version formats are displayed.
The app will be launched at `http://localhost:4200/`.

### No environment

`npm run start` for a server with no environment.

* The displayed version should be the _latest Git tag_ from @saithodev/ts-appversion project (e.g. v1.3.0)

### Development

`npm run start:dev` for a server with development environment.

* The displayed version should be _1.0.0_ (from package.json) with the latest _hash_ of the@saithodev/ts-appversion project (e.g. 1.0.0-gda1e67f)</li>

### Production

`npm run start:prod` for a server with production environment.

* The displayed version should be _1.0.0_ (from package.json)