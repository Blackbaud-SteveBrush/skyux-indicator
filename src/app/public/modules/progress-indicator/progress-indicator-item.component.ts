import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input
} from '@angular/core';
import { SkyProgressIndicatorItemStatus } from './progress-indicator-item-status';

@Component({
  selector: 'sky-progress-indicator-item',
  templateUrl: './progress-indicator-item.component.html',
  styleUrls: ['./progress-indicator-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorItemComponent {
  @Input()
  public title: string;

  public set isVisible(value: boolean) {
    if (value === this._isVisible) {
      return;
    }

    this._isVisible = value;
    this.changeDetector.markForCheck();
  }

  public get isVisible(): boolean {
    return this._isVisible || false;
  }

  public showTimeline = true;

  public set status(value: SkyProgressIndicatorItemStatus) {
    if (value === this._status) {
      return;
    }

    this._status = value;
    this.changeDetector.markForCheck();
  }

  public get status(): SkyProgressIndicatorItemStatus {
    if (this._status === undefined) {
      return SkyProgressIndicatorItemStatus.Incomplete;
    }

    return this._status;
  }

  public get titlePrefix(): string {
    return this._titlePrefix || '';
  }

  public set titlePrefix(value: string) {
    if (value === this._titlePrefix) {
      return;
    }

    this._titlePrefix = value;
    this.changeDetector.markForCheck();
  }

  // Remove this!
  public get statusName(): string {
    switch (this.status) {
      case SkyProgressIndicatorItemStatus.Active:
      return 'active';

      case SkyProgressIndicatorItemStatus.Complete:
      return 'complete';

      case SkyProgressIndicatorItemStatus.Incomplete:
      return 'incomplete';

      default:
      return 'none';
    }
  }

  private _isVisible: boolean;
  private _status: SkyProgressIndicatorItemStatus;
  private _titlePrefix: string;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  public showStepNumber(step: number): void {
    this.titlePrefix = `${step} - `;
  }

  public hideStepNumber(): void {
    this.titlePrefix = '';
  }
}
