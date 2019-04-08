import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  OnInit,
  QueryList,
  Input,
  SimpleChanges,
  OnChanges,
  Output,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

import {
  Subject
} from 'rxjs/Subject';

import 'rxjs/add/operator/takeUntil';

import {
  SkyProgressIndicatorChange
} from './progress-indicator-change';

import {
  SkyProgressIndicatorDisplayMode
} from './progress-indicator-display-mode';

import {
  SkyProgressIndicatorItemStatus
} from './progress-indicator-item-status';

import {
  SkyProgressIndicatorItemComponent
} from './progress-indicator-item.component';

import {
  SkyProgressIndicatorMessage
} from './progress-indicator-message';

import {
  SkyProgressIndicatorMessageType
} from './progress-indicator-message-type';

@Component({
  selector: 'sky-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorComponent
  implements OnInit, AfterContentInit, OnChanges, OnDestroy {

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
  public messageStream = new Subject<SkyProgressIndicatorMessage | SkyProgressIndicatorMessageType>();

  @Input()
  public set startingIndex(value: number) {
    this._startingIndex = value;
  }

  public get startingIndex(): number {
    return this._startingIndex || 0;
  }

  @Output()
  public progressChanges = new Subject<SkyProgressIndicatorChange>();

  @Output()
  public get finished(): Observable<void> {
    return this._finished;
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

  private get activeIndex(): number {
    return this._activeIndex;
  }

  private set activeIndex(value: number) {
    this._activeIndex = value;
  }

  private ngUnsubscribe = new Subject<void>();

  private _activeIndex: number;
  private _displayMode: SkyProgressIndicatorDisplayMode;
  private _finished = new Subject<void>();
  private _hasFinishButton: boolean;
  private _isPassive: boolean;
  private _startingIndex = 0;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    this.activeIndex = this.startingIndex;

    this.messageStream
      .takeUntil(this.ngUnsubscribe)
      .subscribe((message) => {
        this.handleIncomingMessage(message);
      });
  }

  public ngAfterContentInit(): void {
    if (!this.hasFinishButton && this._finished.observers.length) {
      console.warn(
        'You need to use the finish button if you want to subscribe to that event!'
      );
    }

    this.updateSteps();

    // Update the status markers when progress changes.
    // TODO: Put this in a separate `horizontal-status-markers` component?
    this.progressChanges
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.itemStatuses = this.itemComponents.map(c => c.status);
        this.changeDetector.markForCheck();
      });

    this.notifyChange();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.startingIndex &&
      changes.startingIndex.firstChange === false
    ) {
      this.activeIndex = this.startingIndex;
      this.resetSteps();
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private goNextStep(): void {
    this.activeIndex++;

    const length = this.itemComponents.length;
    if (this.activeIndex === length) {
      this.activeIndex = length - 1;
      return;
    }

    this.updateSteps();
    this.notifyChange();
  }

  private goPreviousStep(): void {
    this.activeIndex--;

    if (this.activeIndex === -1) {
      this.activeIndex = 0;
      return;
    }

    this.updateSteps();
    this.notifyChange();
  }

  private gotoStep(index: number): void {
    this.activeIndex = index;
    this.updateSteps();
    this.notifyChange();
  }

  private finishSteps(): void {
    this.itemComponents.forEach((component) => {
      component.status = SkyProgressIndicatorItemStatus.Complete;
    });

    this.notifyChange();
    this._finished.next();
  }

  private resetSteps(): void {
    this.activeIndex = 0;
    this.updateSteps();
    this.notifyChange();
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
        'Send messages with SkyProgressIndicatorMessage instead!'
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
        if (!value.data || value.data.stepIndex === undefined) {
          console.warn(
            'Please provide a step index to travel to!'
          );
          return;
        }

        this.gotoStep(value.data.stepIndex);
        break;

      default:
        break;
    }
  }

  private notifyChange(): void {
    this.progressChanges.next({
      activeIndex: this.activeIndex
    });
  }
}
