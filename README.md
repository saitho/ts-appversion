# TS-AppVersion

[![Build Status](https://travis-ci.com/saitho/ng-appversion.svg?branch=master)](https://travis-ci.com/saitho/ng-appversion)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ts-appversion&metric=alert_status)](https://sonarcloud.io/dashboard?id=ts-appversion)
[![npm version](https://img.shields.io/npm/v/@saithodev/ts-appversion.svg)](https://www.npmjs.com/package/@saithodev/ts-appversion)
[![npm license](https://img.shields.io/npm/l/@saithodev/ts-appversion.svg)](https://www.npmjs.com/package/@saithodev/ts-appversion)
[![Known Vulnerabilities](https://snyk.io/test/github/saitho/ng-appversion/badge.svg?targetFile=package.json)](https://snyk.io/test/github/saitho/ng-appversion?targetFile=package.json)
[![Dependency Status](https://david-dm.org/saitho/ng-appversion/status.svg)](https://david-dm.org/saitho/ng-appversion)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsaitho%2Fng-appversion.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsaitho%2Fng-appversion?ref=badge_shield)

This package extracts version information from your package.json and Git (if configured) and saves it into a TypeScript file.
You can then access that TypeScript file from your application and display the version in your app.

**The examples below illustrate the usage of this package for the Angular framework.
However it should work similarly for any other JavaScript framework that is using TypeScript.**

## Getting started

The package comes with a script that has to be run before your application is built.
You might want to use *prestart* and *prebuild* inside your package.json for that:

```
{
  scripts: [
    "prestart": "ts-appversion",
    "start": "ng serve",
    "prebuild": "ts-appversion",
    "build": "ng build",
  ]
}
```

With that setup the file is updated when `npm start` and `npm build` are run.
*Note:* You won't be able to run `ng build` anymore as the script will not be executed. Use `npm build` instead.

## Command arguments

| Argument  |  Meaning | Default |
|---|---|---|
| --root  | root directory where your package.json is located |  .  |
| --file  | relative location of the output file (based on the root directory) |  ./src/_version.ts  |  false  |
| --git  | relative location of the folder containing the .git folder (based on the root directory) |  .  |
| --pnpm | PNPM has a different folder structure, resulting in a different root level. Add this if you use PNPM to install your dependencies. If package.json is not found at the expected PNPM path, it will fall back to the default one. This setting is ignored if `--root` is an absolute path. | false |

## Receiving the versions

The script generates a TypeScript file at the location `./src/_versions.ts` if you haven't provided a different location.
You'll be able to import the values just like any other package:
```
import { versions, TsAppVersion } from '../_versions';
```

The file will export an object with following variables:

* **version** is the version from the packages.json (e.g. v1.0.0)
* **versionDate** is the timestamp in ISO format when the compilation/package started.
* **versionLong** is the version from the packages.json PLUS the Hash of the current Git-Commit (e.g. v1.0.0-g63962e3) - will only be generated if your repository is a Git Repository
* **gitTag** is the latest Git tag
* **gitCommitHash** is the short hash of the last commit
* **gitCommitDate** is the timestamp in ISO format of the last commit

_Note:_ The variables starting with "git" and the variable "versionLong" will only be available for Git repositories.

## Environment-related versions

In some cases it might be better to not display the version number or only the short notation.
You can use the environments to display different version informations.

In the following example:
- the dev environment will display the version timestamp
- the staging environemnt will diplay the long version (with the Commit hash)
- the production environment will display the simple notation

*environments/environment.ts*
```typescript
import versions from '../_versions';
export const environment = {
  production: false,
  version: versions.versionDate,
};
```

*environments/environment.staging.ts*
```typescript
import versions from '../_versions';
export const environment = {
  production: false,
  version: versions.versionLong,
};
```

*environments/environment.prod.ts*
```typescript
import versions from '../_versions';
export const environment = {
  production: true,
  version: versions.version,
};
```

From there you can access the version inside the Component which should display the version, e.g.:
```typescript
import { Component } from '@angular/core';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root',
  template: '{{title}} {{version}}'
})
export class AppComponent {
  title = 'app';
  version = environment.version ? 'v' + environment.version : '';
}
```

Check out [the example/ directory](example/) for a working example Angular application.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsaitho%2Fng-appversion.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsaitho%2Fng-appversion?ref=badge_large)