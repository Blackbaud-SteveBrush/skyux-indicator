import {
  NgModule
} from '@angular/core';

import {
  SkyPopoverModule
} from '@skyux/popovers';

import {
  SkyAppLinkModule
} from '@skyux/router';

import {
  SkyProgressIndicatorModule
} from './public';

@NgModule({
  exports: [
    SkyAppLinkModule,
    SkyPopoverModule,
    SkyProgressIndicatorModule
  ]
})
export class AppExtrasModule { }
