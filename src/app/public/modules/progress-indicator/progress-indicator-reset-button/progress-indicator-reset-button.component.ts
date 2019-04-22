import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';

import {
  SkyProgressIndicatorMessageType
} from '../types';

import {
  SkyProgressIndicatorComponent
} from '../progress-indicator.component';

@Component({
  selector: 'sky-progress-indicator-reset-button',
  templateUrl: './progress-indicator-reset-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorResetButtonComponent implements OnDestroy {

  @Input()
  public set disabled(value: boolean) {
    this._disabled = value;
    this.changeDetector.markForCheck();
  }

  public get disabled(): boolean {
    return this._disabled || false;
  }

  @Input()
  public progressIndicator: SkyProgressIndicatorComponent;

  @Output()
  public resetClick = new EventEmitter<any>();

  private _disabled: boolean;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) {
    console.warn(
      'The `<sky-progress-indicator-reset-button>` component is deprecated. Please use the following instead:\n' +
      '<sky-progress-indicator-nav-button\n' +
      '  [buttonText]="My reset button text"\n' +
      '  [buttonType]="reset"\n' +
      '></sky-progress-indicator-nav-button>'
    );
  }

  public ngOnDestroy(): void {
    this.resetClick.complete();
  }

  public onClick(): void {
    this.resetClick.emit();

    this.progressIndicator.sendMessage({
      type: SkyProgressIndicatorMessageType.Reset
    });
  }
}
