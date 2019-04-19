import {
  async,
  fakeAsync,
  TestBed,
  ComponentFixture,
  tick
} from '@angular/core/testing';

import {
  expect
} from '@skyux-sdk/testing';

import {
  SkyProgressIndicatorFixtureComponent
} from './fixtures/progress-indicator.component.fixture';

import {
  SkyProgressIndicatorFixtureModule
} from './fixtures/progress-indicator.module.fixture';

import {
  SkyProgressIndicatorDisplayMode,
  SkyProgressIndicatorItemStatus,
  SkyProgressIndicatorMessageType,
  SkyProgressIndicatorNavButtonType
} from './types';

import {
  SkyProgressIndicatorComponent
} from './progress-indicator.component';

describe('Progress indicator component', function () {
  let fixture: ComponentFixture<SkyProgressIndicatorFixtureComponent>;
  let componentInstance: SkyProgressIndicatorFixtureComponent;
  let progressIndicator: SkyProgressIndicatorComponent;
  let consoleWarnSpy: jasmine.Spy;

  function detectChanges(): void {
    fixture.detectChanges();
    tick();
  }

  function stepBackward(): void {
    componentInstance.sendMessage({
      type: SkyProgressIndicatorMessageType.Regress
    });
    detectChanges();
  }

  function stepForward(): void {
    componentInstance.sendMessage({
      type: SkyProgressIndicatorMessageType.Progress
    });
    detectChanges();
  }

  function gotoStep(index?: number): void {
    componentInstance.sendMessage({
      type: SkyProgressIndicatorMessageType.GoTo,
      data: {
        activeIndex: index
      }
    });
    detectChanges();
  }

  function verifyItemStatuses(statuses: SkyProgressIndicatorItemStatus[]): void {
    componentInstance.progressItems.forEach((item, i) => {
      expect(item.status).toEqual(statuses[i]);
    });
  }

  function verifyActiveIndex(index: number): void {
    expect(componentInstance.lastChange.activeIndex).toEqual(index);
  }

  function getNavButtonElement(type: SkyProgressIndicatorNavButtonType): any {
    return fixture.nativeElement.querySelector(`.sky-progress-indicator-nav-button-${type}`);
  }

  // function getButtonComponent(type: SkyProgressIndicatorNavButtonType): SkyProgressIndicatorNavButtonComponent {
  //   return componentInstance.navButtonComponents.find((component) => {
  //     return (component.buttonType === type);
  //   });
  // }

  // function getButtonElement(type: SkyProgressIndicatorNavButtonType): ElementRef<any> {
  //   return componentInstance.navButtonComponents.map((component, i) => {
  //     if (component.buttonType === type) {
  //       return componentInstance.navButtonElements.toArray()[i];
  //     }
  //   })[0];
  // }

  beforeEach(function () {
    TestBed.configureTestingModule({
      imports: [
        SkyProgressIndicatorFixtureModule
      ]
    });

    fixture = TestBed.createComponent(SkyProgressIndicatorFixtureComponent);
    componentInstance = fixture.componentInstance;
    progressIndicator = componentInstance.progressIndicator;

    consoleWarnSpy = spyOn(console, 'warn');
  });

  it('should set defaults', fakeAsync(function () {
    detectChanges();

    expect(progressIndicator.displayMode).toEqual(SkyProgressIndicatorDisplayMode.Vertical);
    expect(progressIndicator.isPassive).toEqual(false);
    expect(progressIndicator.startingIndex).toEqual(0);
  }));

  it('should emit progress changes initially', fakeAsync(function () {
    const spy = spyOn(componentInstance, 'onProgressChanges').and.callThrough();

    detectChanges();

    expect(spy).toHaveBeenCalled();
  }));

  it('should use horizontal display if set', fakeAsync(function () {
    componentInstance.displayMode = SkyProgressIndicatorDisplayMode.Horizontal;

    detectChanges();

    const element = fixture.nativeElement;

    expect(element.querySelector('.sky-progress-indicator-status-markers')).toBeTruthy();
    expect(element.querySelector('.sky-progress-indicator-item .sky-progress-indicator-status-marker')).toBeFalsy();
  }));

  it('should not use passive mode if set for horizontal display', fakeAsync(function () {
    componentInstance.displayMode = SkyProgressIndicatorDisplayMode.Horizontal;
    componentInstance.isPassive = true;

    detectChanges();

    expect(progressIndicator.isPassive).toEqual(false);
  }));

  it('should use starting index if set', fakeAsync(function () {
    componentInstance.startingIndex = 2;

    detectChanges();

    verifyActiveIndex(2);

    verifyItemStatuses([
      SkyProgressIndicatorItemStatus.Complete,
      SkyProgressIndicatorItemStatus.Complete,
      SkyProgressIndicatorItemStatus.Active
    ]);
  }));

  describe('Passive mode', function () {
    it('should use passive mode if set', fakeAsync(function () {
      componentInstance.isPassive = true;

      detectChanges();

      expect(progressIndicator.isPassive).toEqual(true);
    }));

    it('should do passive mode things', fakeAsync(function () {}));
  });

  describe('Message stream', function () {
    it('should navigate through the steps', fakeAsync(function () {
      detectChanges();

      verifyActiveIndex(0);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Active,
        SkyProgressIndicatorItemStatus.Incomplete,
        SkyProgressIndicatorItemStatus.Incomplete
      ]);

      stepForward();

      verifyActiveIndex(1);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Active,
        SkyProgressIndicatorItemStatus.Incomplete
      ]);

      stepBackward();

      verifyActiveIndex(0);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Active,
        SkyProgressIndicatorItemStatus.Incomplete,
        SkyProgressIndicatorItemStatus.Incomplete
      ]);
    }));

    it('should not progress past final step', fakeAsync(function () {
      detectChanges();

      stepForward();
      stepForward();
      stepForward();

      verifyActiveIndex(2);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Active
      ]);

      stepForward();

      verifyActiveIndex(2);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Active
      ]);
    }));

    it('should not regress before first step', fakeAsync(function () {
      detectChanges();

      verifyActiveIndex(0);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Active,
        SkyProgressIndicatorItemStatus.Incomplete,
        SkyProgressIndicatorItemStatus.Incomplete
      ]);

      stepBackward();

      verifyActiveIndex(0);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Active,
        SkyProgressIndicatorItemStatus.Incomplete,
        SkyProgressIndicatorItemStatus.Incomplete
      ]);
    }));

    it('should reset progress', fakeAsync(function () {
      componentInstance.startingIndex = 2;

      detectChanges();

      verifyActiveIndex(2);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Active
      ]);

      componentInstance.sendMessage({
        type: SkyProgressIndicatorMessageType.Reset
      });

      detectChanges();

      verifyActiveIndex(0);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Active,
        SkyProgressIndicatorItemStatus.Incomplete,
        SkyProgressIndicatorItemStatus.Incomplete
      ]);
    }));

    it('should goto a specific step', fakeAsync(function () {
      detectChanges();

      gotoStep(1);

      verifyActiveIndex(1);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Active,
        SkyProgressIndicatorItemStatus.Incomplete
      ]);
    }));

    it('should handle out-of-range indexes', fakeAsync(function () {
      detectChanges();

      gotoStep(100);

      verifyActiveIndex(2);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Active
      ]);

      gotoStep(-20);

      verifyActiveIndex(0);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Active,
        SkyProgressIndicatorItemStatus.Incomplete,
        SkyProgressIndicatorItemStatus.Incomplete
      ]);
    }));

    it('should warn when goto is called without an active index', fakeAsync(function () {
      detectChanges();

      gotoStep(undefined);

      expect(consoleWarnSpy).toHaveBeenCalled();
    }));

    it('should finish all steps', fakeAsync(function () {
      detectChanges();

      const spy = spyOn(componentInstance, 'onProgressChanges').and.callThrough();

      componentInstance.sendMessage({
        type: SkyProgressIndicatorMessageType.Finish
      });

      detectChanges();

      verifyActiveIndex(2);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Complete
      ]);

      expect(spy).toHaveBeenCalledWith({
        activeIndex: 2,
        isFinished: true,
        itemStatuses: [
          SkyProgressIndicatorItemStatus.Complete,
          SkyProgressIndicatorItemStatus.Complete,
          SkyProgressIndicatorItemStatus.Complete
        ]
      });
    }));

    it('should handle undefined message types', fakeAsync(function () {
      detectChanges();

      const spy = spyOn(progressIndicator as any, 'updateSteps').and.callThrough();

      componentInstance.sendMessage({
        type: 1000
      });

      detectChanges();

      expect(spy).not.toHaveBeenCalled();
    }));
  });

  describe('Navigation buttons', function () {
    beforeEach(function () {
      componentInstance.showNavButtons = true;
    });

    it('should set defaults', fakeAsync(() => {
      detectChanges();
      detectChanges();

      const defaultButtonComponent = componentInstance.defaultNavButtonComponent;
      const defaultButtonElement = componentInstance.defaultNavButtonElement.nativeElement;

      expect(defaultButtonComponent.buttonType).toEqual('next');
      expect(defaultButtonElement.textContent).toContain('Next');

      let buttonElement = getNavButtonElement('previous');
      expect(buttonElement.textContent).toContain('Previous');

      buttonElement = getNavButtonElement('next');
      expect(buttonElement.textContent).toContain('Next');

      buttonElement = getNavButtonElement('reset');
      expect(buttonElement.textContent).toContain('Reset');

      // Show finish button.
      gotoStep(4);

      detectChanges();

      buttonElement = getNavButtonElement('finish');
      expect(buttonElement.textContent).toContain('Finish');
    }));

    xit('should set the button type and show default text', fakeAsync(function () {
    }));

    xit('should navigate between the steps', fakeAsync(function () {
    }));

    xit('should reset the steps', fakeAsync(function () {
    }));

    xit('should hide the next button and show the finish button on the last step', fakeAsync(function () {
      // It disables them too!
    }));

    it('should throw error if progress indicator not set as an input', fakeAsync(function () {
      try {
        componentInstance.defaultNavButtonComponent.progressIndicator = undefined;
        detectChanges();
        fail('It should throw error!');
      } catch (error) {
        expect(error).toExist();
      }
    }));
  });

  describe('Accessibility', function () {
    it('should be accessible', async(function () {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(fixture.nativeElement).toBeAccessible();
      });
    }));

    it('should be accessible in passive mode', async(function () {
      componentInstance.isPassive = true;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(fixture.nativeElement).toBeAccessible();
      });
    }));

    it('should be accessible with disabled buttons', async(function () {
      componentInstance.disabled = true;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(fixture.nativeElement).toBeAccessible();
      });
    }));
  });

  describe('Deprecated features', function () {
    it('should warn when message stream called with only the type', fakeAsync(function () {
      detectChanges();

      componentInstance.sendMessageLegacy(SkyProgressIndicatorMessageType.Progress);

      detectChanges();

      expect(consoleWarnSpy).toHaveBeenCalled();

      verifyActiveIndex(1);

      verifyItemStatuses([
        SkyProgressIndicatorItemStatus.Complete,
        SkyProgressIndicatorItemStatus.Active,
        SkyProgressIndicatorItemStatus.Incomplete
      ]);
    }));

    it('should warn if using template reference variable with legacy reset button', fakeAsync(function () {
      detectChanges();

      componentInstance.progressIndicatorTemplateRefLegacy = componentInstance.progressIndicator;

      detectChanges();

      expect(consoleWarnSpy).toHaveBeenCalled();
    }));

    it('should support legacy reset button located inside progress indicator component', fakeAsync(function () {
      detectChanges();

      const resetClickSpy = spyOn(componentInstance, 'onResetClick');

      componentInstance.legacyResetButton.nativeElement.querySelector('button').click();

      detectChanges();

      expect(resetClickSpy).toHaveBeenCalled();
    }));

    it('should support legacy reset button located outside progress indicator component', fakeAsync(function () {
      detectChanges();

      const resetClickSpy = spyOn(componentInstance, 'onResetClick');

      componentInstance.showIsolatedLegacyResetButton = true;

      detectChanges();

      componentInstance.legacyIsolatedResetButton.nativeElement.querySelector('button').click();

      detectChanges();

      expect(resetClickSpy).toHaveBeenCalled();
    }));
  });
});
