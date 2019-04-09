import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  OnInit,
  QueryList,
  Input,
  Output,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import {
  SkyAppWindowRef
} from '@skyux/core';

import {
  Subject
} from 'rxjs/Subject';

import 'rxjs/add/operator/takeUntil';

import {
  SkyProgressIndicatorItemComponent
} from './progress-indicator-item/progress-indicator-item.component';

import {
  SkyProgressIndicatorChange
} from './types/progress-indicator-change';

import {
  SkyProgressIndicatorDisplayMode
} from './types/progress-indicator-display-mode';

import {
  SkyProgressIndicatorItemStatus
} from './types/progress-indicator-item-status';

import {
  SkyProgressIndicatorMessage
} from './types/progress-indicator-message';

import {
  SkyProgressIndicatorMessageType
} from './types/progress-indicator-message-type';

@Component({
  selector: 'sky-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorComponent implements OnInit, AfterContentInit, OnDestroy {

  @Input()
  public set displayMode(value: SkyProgressIndicatorDisplayMode) {
    this._displayMode = value;
  }

  public get displayMode(): SkyProgressIndicatorDisplayMode {
    if (this._displayMode === undefined) {
      return SkyProgressIndicatorDisplayMode.Vertical;
    }

    return this._displayMode;
  }

  @Input()
  public set isPassive(value: boolean) {
    this._isPassive = value;
  }

  public get isPassive(): boolean {
    // Passive mode is not supported for horizontal displays.
    if (this.displayMode === SkyProgressIndicatorDisplayMode.Horizontal) {
      return false;
    }

    return this._isPassive || false;
  }

  @Input()
  public set messageStream(value: Subject<SkyProgressIndicatorMessage | SkyProgressIndicatorMessageType>) {
    if (value) {
      this._messageStream = value;
    }
  }

  @Input()
  public set startingIndex(value: number) {
    this._startingIndex = value;
  }

  public get startingIndex(): number {
    return this._startingIndex || 0;
  }

  @Output()
  public progressChanges = new Subject<SkyProgressIndicatorChange>();

  public get activeIndex(): number {
    return this._activeIndex || 0;
  }

  public set activeIndex(value: number) {
    if (value === undefined) {
      return;
    }

    const length = this.itemComponents.length;
    if (value >= length) {
      value = length - 1;
    }

    if (value < 0) {
      value = 0;
    }

    this._activeIndex = value;
  }

  public get cssClassNames(): string {
    const classNames = [
      `sky-progress-indicator-mode-${this.displayModeName}`
    ];

    if (this.isPassive) {
      classNames.push('sky-progress-indicator-passive');
    }

    return classNames.join(' ');
  }

  public get displayModeName(): string {
    if (this.displayMode === SkyProgressIndicatorDisplayMode.Vertical) {
      return 'vertical';
    }

    return 'horizontal';
  }

  // This field was added to support legacy API.
  public get hasFinishButton(): boolean {
    return this._hasFinishButton || false;
  }

  public set hasFinishButton(value: boolean) {
    this._hasFinishButton = value;
  }

  public get numSteps(): number {
    return this.itemComponents.length;
  }

  public itemStatuses: SkyProgressIndicatorItemStatus[] = [];

  @ContentChildren(SkyProgressIndicatorItemComponent)
  private itemComponents: QueryList<SkyProgressIndicatorItemComponent>;

  private ngUnsubscribe = new Subject<void>();

  private _activeIndex: number;
  private _displayMode: SkyProgressIndicatorDisplayMode;
  private _hasFinishButton: boolean;
  private _isPassive: boolean;
  private _messageStream = new Subject<SkyProgressIndicatorMessage | SkyProgressIndicatorMessageType>();
  private _startingIndex: number;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private windowRef: SkyAppWindowRef
  ) { }

  public ngOnInit(): void {
    this.subscribeToMessageStream();
  }

  public ngAfterContentInit(): void {
    this.activeIndex = this.startingIndex;

    this.updateSteps();

    // Update the status markers when progress changes.
    // TODO: Put this in a separate `horizontal-status-markers` component?
    this.progressChanges
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.updateItemStatuses();
      });

    this.windowRef.nativeWindow.setTimeout(() => {
      this.notifyChange({
        activeIndex: this.activeIndex
      });
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public sendMessage(message: SkyProgressIndicatorMessage): void {
    this._messageStream.next(message);
  }

  private goNextStep(): void {
    this.activeIndex++;

    const length = this.itemComponents.length;
    if (this.activeIndex === length) {
      this.activeIndex = length - 1;
      return;
    }

    this.updateSteps();
    this.notifyChange({
      activeIndex: this.activeIndex
    });
  }

  private goPreviousStep(): void {
    this.activeIndex--;

    if (this.activeIndex === -1) {
      this.activeIndex = 0;
      return;
    }

    this.updateSteps();
    this.notifyChange({
      activeIndex: this.activeIndex
    });
  }

  private gotoStep(index: number): void {
    this.activeIndex = index;
    this.updateSteps();
    this.notifyChange({
      activeIndex: this.activeIndex
    });
  }

  private finishSteps(): void {
    this.activeIndex = 0;

    this.itemComponents.forEach((component) => {
      component.status = SkyProgressIndicatorItemStatus.Complete;
    });

    this.notifyChange({
      activeIndex: this.activeIndex,
      isFinished: true
    });
  }

  private resetSteps(): void {
    this.activeIndex = 0;
    this.updateSteps();
    this.notifyChange({
      activeIndex: this.activeIndex
    });
  }

  private updateSteps(): void {
    const activeIndex = this.activeIndex;
    const isPassive = this.isPassive;
    const isVertical = (this.displayMode === SkyProgressIndicatorDisplayMode.Vertical);

    this.itemComponents.forEach((component, i) => {

      // Set visibility.
      component.isVisible = (
        activeIndex === i ||
        isVertical
      );

      // Set status.
      if (activeIndex === i) {
        if (isPassive) {
          component.status = SkyProgressIndicatorItemStatus.Pending;
        } else {
          component.status = SkyProgressIndicatorItemStatus.Active;
        }
      } else if (activeIndex > i) {
        component.status = SkyProgressIndicatorItemStatus.Complete;
      } else {
        component.status = SkyProgressIndicatorItemStatus.Incomplete;
      }

      // Show or hide the status markers.
      component.showStatusMarker = isVertical;

      // Show or hide the step number.
      if (isPassive) {
        component.hideStepNumber();
      } else {
        component.showStepNumber(i + 1);
      }

      // If we're in passive mode, don't show titles for incomplete items.
      component.showTitle = !(
        isPassive &&
        activeIndex < i
      );
    });
  }

  private handleIncomingMessage(message: SkyProgressIndicatorMessage | SkyProgressIndicatorMessageType): void {
    const value: any = message;

    let type: SkyProgressIndicatorMessageType;
    if (value.type === undefined) {
      console.warn(
        'Send messages with `SkyProgressIndicatorMessage` instead!'
      );
      type = value;
    } else {
      type = value.type;
    }

    switch (type) {
      case SkyProgressIndicatorMessageType.Finish:
        this.finishSteps();
        break;

      case SkyProgressIndicatorMessageType.Progress:
        this.goNextStep();
        break;

      case SkyProgressIndicatorMessageType.Regress:
        this.goPreviousStep();
        break;

      case SkyProgressIndicatorMessageType.Reset:
        this.resetSteps();
        break;

      case SkyProgressIndicatorMessageType.GoTo:
        if (!value.data || value.data.activeIndex === undefined) {
          console.warn(
            'Please provide a step index to travel to!'
          );
          return;
        }

        this.gotoStep(value.data.activeIndex);
        break;

      default:
        break;
    }
  }

  private subscribeToMessageStream(): void {
    this._messageStream
      .takeUntil(this.ngUnsubscribe)
      .subscribe((message) => {
        this.handleIncomingMessage(message);
      });
  }

  private notifyChange(change: SkyProgressIndicatorChange): void {
    this.progressChanges.next(change);
  }

  private updateItemStatuses(): void {
    this.itemStatuses = this.itemComponents.map(c => c.status);
    this.changeDetector.markForCheck();
  }
}
