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
  selector: 'sky-progress-indicator-timeline',
  templateUrl: './progress-indicator-timeline.component.html',
  styleUrls: ['./progress-indicator-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorTimelineComponent {
  @Input()
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

  public get cssClassNames(): string {
    const classNames = [
      `sky-progress-indicator-timeline-status-${this.statusName}`
    ];

    return classNames.join(' ');
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

  private _status: SkyProgressIndicatorItemStatus;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }
}
