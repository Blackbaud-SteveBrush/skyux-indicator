import {
  NgModule
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  SkyI18nModule
} from '@skyux/i18n';

import {
  SkyIconModule
} from '@skyux/indicators';

import {
  SkyProgressIndicatorResourcesModule
} from '../shared/progress-indicator-resources.module';

import {
  SkyProgressIndicatorComponent
} from './progress-indicator.component';

import {
  SkyProgressIndicatorItemComponent
} from './progress-indicator-item.component';

import {
  SkyProgressIndicatorNavButtonComponent
} from './progress-indicator-nav-button.component';

import {
  SkyProgressIndicatorResetButtonComponent
} from './progress-indicator-reset-button.component';

import {
  SkyProgressIndicatorTimelineComponent
} from './progress-indicator-timeline.component';

import {
  SkyProgressIndicatorTitleComponent
} from './progress-indicator-title.component';

@NgModule({
  declarations: [
    SkyProgressIndicatorComponent,
    SkyProgressIndicatorItemComponent,
    SkyProgressIndicatorNavButtonComponent,
    SkyProgressIndicatorResetButtonComponent,
    SkyProgressIndicatorTimelineComponent,
    SkyProgressIndicatorTitleComponent
  ],
  imports: [
    CommonModule,
    SkyI18nModule,
    SkyIconModule,
    SkyProgressIndicatorResourcesModule
  ],
  exports: [
    SkyProgressIndicatorComponent,
    SkyProgressIndicatorItemComponent,
    SkyProgressIndicatorNavButtonComponent,
    SkyProgressIndicatorResetButtonComponent,
    SkyProgressIndicatorTimelineComponent,
    SkyProgressIndicatorTitleComponent
  ]
})
export class SkyProgressIndicatorModule { }
