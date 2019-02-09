# NgAppVersion

This package extracts version information from your package.json and Git (if configured) and saves it into a TypeScript file.
You can then access that TypeScript file from your Angular application and display the version in your Angular app.

## Getting started

The package comes with a script that has to be run before the building.
You might want to use *prestart* and *prebuild* inside your package.json for that:

```
{
  scripts: [
    "prestart": "node ./node_modules/ng-appversion/index.js",
    "start": "ng serve",
    "prebuild": "node ./node_modules/ng-appversion/index.js",
    "build": "ng build",
  ]
}
```

With that setup the file is updated when `npm start` and `npm run-script build` are run.
*Note:* You won't be able to run `ng build` anymore as the script will not be executed. Use `npm run-script build` instead.

## Command arguments

| Argument  |  Meaning | Default |
|---|---|---|
| --root  | root directory where your package.json is located |  .  |
| --file  | relative location of the output file (based on the root directory) |  ./src/_version.ts  |
| --force-git  | force Git detection (deprecated, use --git instead to point to your .git directory)  |  false  |
| --git  | relative location of the .git directory to use (based on the root directory) |  .  |

## Receiving the versions

The script generates a TypeScript file at the location `./src/_versions.ts` if you haven't provided a different location.
You'll be able to import the values just like any other package:
```

import { version } from '../_versions';
```

The file will contain two version numbers:

* **version** is the version from the packages.json (e.g. v1.0.0)
* **versionLong** is the version from the packages.json PLUS the Hash of the current Git-Commit (e.g. v1.0.0-g63962e3) - will only be generated if your repository is a Git Repository

## Environment-related versions

In some cases it might be better to not display the version number or only the short notation.
You can use the environments to display different version informations.

In the following example:
- the dev environment will not display a version
- the staging environemnt will diplay the long version (with the Commit hash)
- the production environment will display the simple notation

*environments/environment.ts*
```typescript
export const environment = {
  production: false,
  version: '',
};
```

*environments/environment.staging.ts*
```typescript
import { versionLong } from '../_versions';
export const environment = {
  production: false,
  version: versionLong,
};
```

*environments/environment.prod.ts*
```typescript
import { version } from '../_versions';
export const environment = {
  production: true,
  version: version,
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
