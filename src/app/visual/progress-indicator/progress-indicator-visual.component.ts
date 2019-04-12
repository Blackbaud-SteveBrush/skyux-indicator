import {
  Component,
  OnInit
} from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { SkyProgressIndicatorChange, SkyProgressIndicatorMessage, SkyProgressIndicatorMessageType } from '../../public';

@Component({
  selector: 'sky-progress-indicator-visual',
  templateUrl: './progress-indicator-visual.component.html',
  styleUrls: ['./progress-indicator-visual.component.scss']
})
export class SkyProgressIndicatorVisualComponent implements OnInit {

  public disabled: boolean;
  public messageStream = new Subject<SkyProgressIndicatorMessage>();
  public messageStreamHorizontal = new Subject<any>();
  public startingIndex: number;

  public ngOnInit(): void { }

  public sendMessage(message: any): void {
    this.messageStream.next(message);
  }

  public onPreviousClick(): void {
    this.sendMessage({
      type: SkyProgressIndicatorMessageType.Regress
    });
  }

  public onNextClick(): void {
    this.sendMessage({
      type: SkyProgressIndicatorMessageType.Progress
    });
  }

  public onProgressChanges(changes: SkyProgressIndicatorChange): void {
    console.log('changes:', changes);
  }

  public onGoToClick(): void {
    this.sendMessage({
      type: SkyProgressIndicatorMessageType.GoTo,
      data: {
        activeIndex: 0
      }
    });
  }

  public disableNavButtons(): void {
    this.disabled = !this.disabled;
  }
}
