import {
  ChangeDetectionStrategy,
  Component,
  OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { SkyProgressIndicatorMessageType } from '../../public';
import { SkyProgressIndicatorChange } from '../../public';

@Component({
  selector: 'sky-progress-indicator-visual',
  templateUrl: './progress-indicator-visual.component.html',
  styleUrls: ['./progress-indicator-visual.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyProgressIndicatorVisualComponent implements OnInit {
  public messageStream = new Subject<any>();
  public messageStreamHorizontal = new Subject<any>();

  public ngOnInit(): void {
  }

  public onFinished(): void {
    console.log('Finished!');
  }

  public onPreviousClick(): void {
    this.messageStream.next(SkyProgressIndicatorMessageType.Regress);
  }

  public onNextClick(): void {
    this.messageStream.next({
      type: SkyProgressIndicatorMessageType.Progress
    });
  }

  public onProgressChanges(changes: SkyProgressIndicatorChange): void {
    console.log('changes:', changes);
  }

  public onGoToClick(): void {
    this.messageStream.next({
      type: SkyProgressIndicatorMessageType.GoTo,
      data: {
        stepIndex: 0
      }
    });
  }
}
