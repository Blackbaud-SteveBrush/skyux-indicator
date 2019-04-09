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
  // public buttonConfigs: {
  //   text: string;
  //   type: SkyProgressIndicatorNavButtonType;
  // }[] = [
  //   {
  //     text: 'My Finish',
  //     type: 'finish'
  //   },
  //   {
  //     text: 'My Next',
  //     type: 'next'
  //   },
  //   {
  //     text: 'My Previous',
  //     type: 'previous'
  //   },
  //   {
  //     text: 'My Reset',
  //     type: 'reset'
  //   }
  // ];

  public disabled: boolean;
  public messageStream: Subject<SkyProgressIndicatorMessage>;
  // public messageStreamHorizontal = new Subject<any>();
  public startingIndex: number;

  public ngOnInit(): void {
    // setTimeout(() => {
    //   this.messageStream = new Subject<any>();
    // }, 1000);
  }

  public setNewMessageStream(): void {
    if (!this.messageStream) {
      this.messageStream = new Subject<SkyProgressIndicatorMessage>();
    }
  }

  public sendMessage(message: any): void {
    this.setNewMessageStream();

    setTimeout(() => {
      this.messageStream.next(message);
    });
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
