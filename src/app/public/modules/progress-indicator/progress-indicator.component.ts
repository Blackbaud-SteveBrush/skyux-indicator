import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  OnInit,
  OnDestroy,
  Output,
  QueryList,
  ChangeDetectorRef
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
  SkyProgressIndicatorChange,
  SkyProgressIndicatorDisplayMode,
  SkyProgressIndicatorItemStatus,
  SkyProgressIndicatorMessage,
  SkyProgressIndicatorMessageType
} from './types';

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
    // Currently, passive mode is not supported for horizontal displays.
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

  public get hasFinishButton(): boolean {
    return this._hasFinishButton || false;
  }

  public set hasFinishButton(value: boolean) {
    this._hasFinishButton = value;
  }

  public get itemStatuses(): SkyProgressIndicatorItemStatus[] {
    if (!this.itemComponents) {
      return [];
    }

    const statuses = this.itemComponents.map(c => c.status);

    // Update the view whenever item statuses change.
    this.changeDetector.markForCheck();

    return statuses;
  }

  @ContentChildren(SkyProgressIndicatorItemComponent)
  private itemComponents: QueryList<SkyProgressIndicatorItemComponent>;

  private get activeIndex(): number {
    return this._activeIndex || 0;
  }

  private set activeIndex(value: number) {
    const lastIndex = this.itemComponents.length - 1;

    if (value > lastIndex) {
      value = lastIndex;
    }

    if (value < 0) {
      value = 0;
    }

    this._activeIndex = value;
  }

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

    // Wait for item components' change detection to complete
    // before notifying changes to the consumer.
    this.windowRef.nativeWindow.setTimeout(() => {
      this.notifyChange();
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public sendMessage(message: SkyProgressIndicatorMessage): void {
    this._messageStream.next(message);
  }

  private gotoNextStep(): void {
    const nextIndex = this.activeIndex + 1;
    const lastIndex = this.itemComponents.length - 1;

    if (nextIndex > lastIndex) {
      return;
    }

    this.gotoStep(nextIndex);
  }

  private gotoPreviousStep(): void {
    const previousIndex = this.activeIndex - 1;

    if (previousIndex < 0) {
      return;
    }

    this.gotoStep(previousIndex);
  }

  private gotoStep(index: number): void {
    this.activeIndex = index;
    this.updateSteps();
    this.notifyChange();
  }

  private finishSteps(): void {
    this.activeIndex = this.itemComponents.length - 1;

    this.itemComponents.forEach((component) => {
      component.status = SkyProgressIndicatorItemStatus.Complete;
    });

    this.notifyChange({
      isFinished: true
    });
  }

  private resetSteps(): void {
    this.gotoStep(0);
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

    // Prints a deprecation warning if the consumer provides only `SkyProgressIndicatorMessageType`.
    if (value.type === undefined) {
      console.warn(
        'The progress indicator component\'s `messageStream` input was ' +
        'set to `Subject<SkyProgressIndicatorMessageType>`. This is a ' +
        'deprecated type and will be removed in the next major version release. ' +
        'Instead, set the `messageStream` input to `Subject<SkyProgressIndicatorMessage>`.'
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
        this.gotoNextStep();
        break;

      case SkyProgressIndicatorMessageType.Regress:
        this.gotoPreviousStep();
        break;

      case SkyProgressIndicatorMessageType.Reset:
        this.resetSteps();
        break;

      case SkyProgressIndicatorMessageType.GoTo:
        if (
          !value.data ||
          value.data.activeIndex === undefined
        ) {
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

  private notifyChange(change?: SkyProgressIndicatorChange): void {
    this.progressChanges.next(
      Object.assign({}, {
        activeIndex: this.activeIndex,
        itemStatuses: this.itemStatuses
      }, change)
    );
  }
}
