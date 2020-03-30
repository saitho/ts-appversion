import { Component } from '@angular/core';
import { environment } from "../environments/environment";

import { TsAppVersion, versions } from 'src/_versions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title: string = 'sample-app';

  // form environment
  public version: string = environment.version;

  // from _version.ts directly
  public readonly tsAppVersion: TsAppVersion;

  /**
   * AppComponent ctor
   */
  constructor() {
    // you can refer direcly to 'versions' information in your component
    this.tsAppVersion = versions;
  }
}
