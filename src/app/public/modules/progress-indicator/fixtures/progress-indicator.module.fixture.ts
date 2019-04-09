import {
  NgModule
} from '@angular/core';

import { SkyProgressIndicatorModule } from '../progress-indicator.module';
import { SkyProgressIndicatorFixtureComponent } from './progress-indicator.component.fixture';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    SkyProgressIndicatorFixtureComponent
  ],
  imports: [
    CommonModule,
    SkyProgressIndicatorModule
  ],
  exports: [
    SkyProgressIndicatorFixtureComponent
  ]
})
export class SkyProgressIndicatorFixtureModule { }
