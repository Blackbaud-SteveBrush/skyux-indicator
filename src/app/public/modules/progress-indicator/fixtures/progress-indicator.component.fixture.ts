import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  TemplateRef
} from '@angular/core';

import {
  Subject
} from 'rxjs/Subject';

import {
  SkyProgressIndicatorDisplayMode
} from '../types/progress-indicator-display-mode';

import {
  SkyProgressIndicatorMessageType
} from '../types/progress-indicator-message-type';

import { SkyProgressIndicatorComponent } from '../progress-indicator.component';

import { SkyProgressIndicatorItemComponent } from '../progress-indicator-item/progress-indicator-item.component';

import { SkyProgressIndicatorMessage } from '../types/progress-indicator-message';

import { SkyProgressIndicatorResetButtonComponent } from '../progress-indicator-reset-button/progress-indicator-reset-button.component';
import { SkyProgressIndicatorNavButtonType } from '../types/progress-indicator-nav-button-type';
import { SkyProgressIndicatorNavButtonComponent } from '../progress-indicator-nav-button/progress-indicator-nav-button.component';

@Component({
  selector: 'sky-progress-indicator-fixture',
  templateUrl: './progress-indicator.component.fixture.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorFixtureComponent {

  @ViewChild(SkyProgressIndicatorComponent)
  public progressIndicator: SkyProgressIndicatorComponent;

  @ViewChild('progressIndicator', { read: TemplateRef })
  public progressIndicatorTemplateRef: TemplateRef<any>;

  @ViewChild(SkyProgressIndicatorResetButtonComponent)
  public resetButtonComponentLegacy: SkyProgressIndicatorResetButtonComponent;

  @ViewChild('legacyResetButton', { read: ElementRef })
  public legacyResetButton: ElementRef<any>;

  @ViewChild('legacyIsolatedResetButton', { read: ElementRef })
  public legacyIsolatedResetButton: ElementRef<any>;

  @ViewChild('defaultNavButton', { read: SkyProgressIndicatorNavButtonComponent })
  public defaultNavButtonComponent: SkyProgressIndicatorNavButtonComponent;

  @ViewChild('defaultNavButton', { read: ElementRef })
  public defaultNavButtonElement: ElementRef;

  @ViewChildren(SkyProgressIndicatorItemComponent)
  public progressItems: QueryList<SkyProgressIndicatorItemComponent>;

  @ViewChildren(SkyProgressIndicatorNavButtonComponent)
  public navButtonComponents: QueryList<SkyProgressIndicatorNavButtonComponent>;

  @ViewChildren(SkyProgressIndicatorNavButtonComponent, { read: ElementRef })
  public navButtonElements: QueryList<ElementRef>;

  // Progress indicator component inputs.
  public displayMode: SkyProgressIndicatorDisplayMode;
  public isPassive: boolean;
  public messageStream = new Subject<SkyProgressIndicatorMessage | SkyProgressIndicatorMessageType>();
  public startingIndex: number;

  // Nav button inputs.
  public disabled: boolean;

  public buttonConfigs: {
    text?: string;
    type: SkyProgressIndicatorNavButtonType;
  }[] = [
    {
      type: 'finish'
    },
    {
      type: 'next'
    },
    {
      type: 'previous'
    },
    {
      type: 'reset'
    }
  ];

  // Template values.
  public showNavButtons = false;
  public showIsolatedLegacyResetButton = false;
  public progressIndicatorTemplateRefLegacy: SkyProgressIndicatorComponent;

  public onProgressChanges(): void { }

  public onResetClick(): void { }

  public sendMessage(message: SkyProgressIndicatorMessage): void {
    this.messageStream.next(message);
  }

  public sendMessageLegacy(type: SkyProgressIndicatorMessageType): void {
    this.messageStream.next(type);
  }

  public setNavButtonText(): void {
    this.buttonConfigs = [
      {
        text: 'My Finish',
        type: 'finish'
      },
      {
        text: 'My Next',
        type: 'next'
      },
      {
        text: 'My Previous',
        type: 'previous'
      },
      {
        text: 'My Reset',
        type: 'reset'
      }
    ];
  }
}
