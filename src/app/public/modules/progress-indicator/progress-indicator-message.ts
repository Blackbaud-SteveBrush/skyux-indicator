import {
  SkyProgressIndicatorMessageType
} from './progress-indicator-message-type';

export interface SkyProgressIndicatorMessage {
  type: SkyProgressIndicatorMessageType;
  data?: {
    /**
     * Used in conjunction with SkyProgressIndicatorMessageType.GoTo
     * to travel to a specific step by a specified index number.
     */
    stepIndex?: number;
    [key: string]: any;
  };
}
