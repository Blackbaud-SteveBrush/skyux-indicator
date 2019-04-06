import {
  SkyProgressIndicatorMessageType
} from './progress-indicator-message-type';

export interface SkyProgressIndicatorMessage {
  type: SkyProgressIndicatorMessageType;
  data?: any;
}
