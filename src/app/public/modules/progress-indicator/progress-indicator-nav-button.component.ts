import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import {
  Subject
} from 'rxjs/Subject';

import 'rxjs/add/operator/distinctUntilChanged';

import 'rxjs/add/operator/takeUntil';

import { SkyProgressIndicatorChange } from './types/progress-indicator-change';
import { SkyProgressIndicatorMessageType } from './types/progress-indicator-message-type';
import { SkyProgressIndicatorNavButtonType } from './types/progress-indicator-nav-button-type';

import { SkyProgressIndicatorComponent } from './progress-indicator.component';

@Component({
  selector: 'sky-progress-indicator-nav-button',
  templateUrl: './progress-indicator-nav-button.component.html',
  styleUrls: ['./progress-indicator-nav-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorNavButtonComponent implements OnInit, OnDestroy {
  @Input()
  public buttonText: string;

  @Input()
  public set buttonType(value: SkyProgressIndicatorNavButtonType) {
    this._buttonType = value;
  }

  public get buttonType(): SkyProgressIndicatorNavButtonType {
    if (this._buttonType === undefined) {
      return 'next';
    }

    return this._buttonType;
  }

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

  public get cssClassNames(): string {
    if (this.buttonType === 'next' || this.buttonType === 'finish') {
      return 'sky-btn-primary';
    }

    if (this.buttonType === 'reset') {
      return 'sky-btn-link';
    }

    return 'sky-btn-default';
  }

  public get buttonLabelResourceString(): string {
    return `skyux_progress_indicator_navigator_${this.buttonType}`;
  }

  public set isVisible(value: boolean) {
    this._isVisible = value;
    this.changeDetector.markForCheck();
  }

  public get isVisible(): boolean {
    return this._isVisible || false;
  }

  private ngUnsubscribe = new Subject<void>();

  private _buttonType: SkyProgressIndicatorNavButtonType;
  private _disabled: boolean;
  private _isVisible: boolean;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    if (!this.progressIndicator) {
      throw new Error(
        'You must add a progress indicator component!'
      );
    }

    if (this.buttonType === 'finish') {
      this.progressIndicator.hasFinishButton = true;
    }

    this.progressIndicator.progressChanges
      .distinctUntilChanged()
      .takeUntil(this.ngUnsubscribe)
      .subscribe((change: SkyProgressIndicatorChange) => {
        this.disabled = false;
        this.isVisible = true;

        const isLastStep = (change.activeIndex === this.progressIndicator.numSteps - 1);

        // The finish button should default to being disabled.
        if (this.buttonType === 'finish') {
          this.isVisible = (isLastStep);
          return;
        }

        if (
          this.buttonType === 'previous' &&
          change.activeIndex === 0
        ) {
          this.disabled = true;
          return;
        }

        if (
          this.buttonType === 'next' &&
          isLastStep
        ) {
          if (this.progressIndicator.hasFinishButton) {
            this.isVisible = false;
          }

          this.disabled = true;
          return;
        }
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onClick(): void {
    let type: SkyProgressIndicatorMessageType;

    switch (this.buttonType) {
      case 'finish':
      type = SkyProgressIndicatorMessageType.Finish;
      break;

      case 'next':
      type = SkyProgressIndicatorMessageType.Progress;
      break;

      case 'previous':
      type = SkyProgressIndicatorMessageType.Regress;
      break;

      case 'reset':
      type = SkyProgressIndicatorMessageType.Reset;
      break;

      default:
      break;
    }

    this.progressIndicator.messageStream.next({
      type
    });
  }
}
