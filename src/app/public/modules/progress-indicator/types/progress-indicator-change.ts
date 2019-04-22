import {
  SkyProgressIndicatorItemStatus
} from './progress-indicator-item-status';

export interface SkyProgressIndicatorChange {
  activeIndex?: number;
  isFinished?: boolean;
  itemStatuses?: SkyProgressIndicatorItemStatus[];
}
