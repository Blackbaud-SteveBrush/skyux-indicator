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
  Output
} from '@angular/core';

import {
  Subject
} from 'rxjs/Subject';

import {
  SkyProgressIndicatorChange
} from './progress-indicator-change';

import {
  SkyProgressIndicatorItemComponent
} from './progress-indicator-item.component';

import {
  SkyProgressIndicatorMessage
} from './progress-indicator-message';

import {
  SkyProgressIndicatorMessageType
} from './progress-indicator-message-type';
import { Observable } from 'rxjs';
import { SkyProgressIndicatorDisplayMode } from './progress-indicator-display-mode';
import { SkyProgressIndicatorItemStatus } from './progress-indicator-item-status';

@Component({
  selector: 'sky-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorComponent
  implements OnInit, AfterContentInit, OnChanges {

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

  @ContentChildren(SkyProgressIndicatorItemComponent)
  private itemComponents: QueryList<SkyProgressIndicatorItemComponent>;

  private get activeIndex(): number {
    return this._activeIndex;
  }

  private set activeIndex(value: number) {
    this._activeIndex = value;
  }

  private _activeIndex: number;
  private _displayMode: SkyProgressIndicatorDisplayMode;
  private _finished = new Subject<void>();
  private _hasFinishButton: boolean;
  private _isPassive: boolean;
  private _startingIndex = 0;

  public ngOnInit(): void {
    this.activeIndex = this.startingIndex;

    this.messageStream.subscribe((message) => {
      this.handleIncomingMessage(message);
    });
  }

  public ngAfterContentInit(): void {
    if (!this.hasFinishButton && this._finished.observers.length) {
      throw 'You need to use the finish button if you want to subscribe to that event!';
    }

    this.updateSteps();
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

  private goNextStep(): void {
    this.activeIndex++;

    const length = this.itemComponents.length;
    if (this.activeIndex === length) {
      this.activeIndex = length - 1;
      return;
    }

    this.notifyChange();
    this.updateSteps();
  }

  private goPreviousStep(): void {
    this.activeIndex--;

    if (this.activeIndex === -1) {
      this.activeIndex = 0;
      return;
    }

    this.notifyChange();
    this.updateSteps();
  }

  private finishSteps(): void {
    this.itemComponents.forEach((component) => {
      component.status = SkyProgressIndicatorItemStatus.Complete;
    });

    this._finished.next();
  }

  private resetSteps(): void {
    this.activeIndex = this.startingIndex;
    this.notifyChange();
    this.updateSteps();
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
        component.status = SkyProgressIndicatorItemStatus.Active;
      } else if (activeIndex > i) {
        component.status = SkyProgressIndicatorItemStatus.Complete;
      } else {
        component.status = SkyProgressIndicatorItemStatus.Incomplete;
      }

      // Show or hide the timeline graphic?
      component.showTimeline = isVertical;

      // Show or hide the step number?
      if (
        isVertical &&
        // This seems weird to me, that passive mode is really only disabling the title counter?
        !isPassive
      ) {
        component.showStepNumber(i + 1);
      } else {
        component.hideStepNumber();
      }
    });
  }

  private handleIncomingMessage(message: SkyProgressIndicatorMessage | SkyProgressIndicatorMessageType): void {
    let type: SkyProgressIndicatorMessageType;
    const value: any = message;
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
