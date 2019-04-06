import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input
} from '@angular/core';

import {
  SkyProgressIndicatorItemStatus
} from './progress-indicator-item-status';

@Component({
  selector: 'sky-progress-indicator-item',
  templateUrl: './progress-indicator-item.component.html',
  styleUrls: ['./progress-indicator-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorItemComponent {
  @Input()
  public title: string;

  public get cssClassNames(): string {
    const classNames = [
      `sky-progress-indicator-item-status-${this.statusName}`
    ];

    return classNames.join(' ');
  }

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

  public get statusName(): string {
    let name: string;

    switch (this.status) {
      case SkyProgressIndicatorItemStatus.Active:
      name = 'active';
      break;

      case SkyProgressIndicatorItemStatus.Complete:
      name = 'complete';
      break;

      case SkyProgressIndicatorItemStatus.Incomplete:
      name = 'incomplete';
      break;

      case SkyProgressIndicatorItemStatus.Pending:
      name = 'pending';
      break;

      default:
      name = 'none';
      break;
    }

    return name;
  }

  public showTimeline = true;
  public showTitle = true;

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
