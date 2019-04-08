import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Optional
} from '@angular/core';

import {
  SkyProgressIndicatorMessageType
} from './types/progress-indicator-message-type';

import {
  SkyProgressIndicatorComponent
} from './progress-indicator.component';

@Component({
  selector: 'sky-progress-indicator-reset-button',
  templateUrl: './progress-indicator-reset-button.component.html',
  styleUrls: ['./progress-indicator-reset-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorResetButtonComponent implements OnDestroy, OnInit {

  @Input()
  public set disabled(value: boolean) {
    this._disabled = value;
    this.changeDetector.markForCheck();
  }

  public get disabled(): boolean {
    return this._disabled || false;
  }

  @Input()
  public set progressIndicator(value: SkyProgressIndicatorComponent) {
    console.warn(
      'This component is designed to be located inside the progress indicator component.' +
      'If it is, you can remove the `[progressIndicator]` property.' +
      'If you need a reset button located outside of the progress indicator component ' +
      'Use the progress indicator button instead.'
    );

    this._progressIndicator = value;
  }

  public get progressIndicator(): SkyProgressIndicatorComponent {
    return this._progressIndicator;
  }

  @Output()
  public resetClick = new EventEmitter<any>();

  private _disabled: boolean;
  private _progressIndicator: SkyProgressIndicatorComponent;

  constructor(
    private changeDetector: ChangeDetectorRef,
    @Optional() private parentComponent: SkyProgressIndicatorComponent
  ) { }

  public ngOnInit(): void {
    if (this.parentComponent) {
      this._progressIndicator = this.parentComponent;
    }
  }

  public ngOnDestroy(): void {
    this.resetClick.complete();
  }

  public resetProgress(): void {
    this.resetClick.emit();

    this.progressIndicator.messageStream.next({
      type: SkyProgressIndicatorMessageType.Reset
    });
  }
}
