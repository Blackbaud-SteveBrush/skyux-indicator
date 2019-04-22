import {
  expect,
  SkyHostBrowser
} from '@skyux-sdk/e2e';

import {
  by,
  element
} from 'protractor';

function performClick(query: string): void {
  const elem = element(by.css(query));
  elem.click();
}

describe('Progress indicator', function () {
  beforeEach(function () {
    SkyHostBrowser.get('visual/progress-indicator');
    SkyHostBrowser.setWindowBreakpoint('lg');
  });

  describe('Vertical display', function () {
    const screenshotElementId = 'app-screenshot-display-mode-vertical';

    beforeEach(function () {
      performClick(`#${screenshotElementId}-next-button`);

      SkyHostBrowser.moveCursorOffScreen();
      SkyHostBrowser.scrollTo(`#${screenshotElementId}`);
    });

    it('should match previous screenshot', function (done) {
      expect(`#${screenshotElementId}`).toMatchBaselineScreenshot(done, {
        screenshotName: 'progress-indicator-vertical'
      });
    });

    it('should match previous screenshot (xs)', function (done) {
      SkyHostBrowser.setWindowBreakpoint('xs');

      expect(`#${screenshotElementId}`).toMatchBaselineScreenshot(done, {
        screenshotName: 'progress-indicator-vertical-xs'
      });
    });
  });

  describe('Horizontal display', function () {
    const screenshotElementId = 'app-screenshot-display-mode-horizontal';

    beforeEach(function () {
      performClick(`#${screenshotElementId}-next-button button`);

      SkyHostBrowser.moveCursorOffScreen();
      SkyHostBrowser.scrollTo(`#${screenshotElementId}`);
    });

    it('should match previous screenshot', function (done) {
      expect(`#${screenshotElementId}`).toMatchBaselineScreenshot(done, {
        screenshotName: 'progress-indicator-horizontal'
      });
    });

    it('should match disabled buttons previous screenshot', function (done) {
      const buttonElement = element(by.id(`${screenshotElementId}-disable-buttons-button`));
      buttonElement.click();

      expect(`#${screenshotElementId}`).toMatchBaselineScreenshot(done, {
        screenshotName: 'progress-indicator-horizontal-disabled'
      });
    });

    it('should match previous screenshot (xs)', function (done) {
      SkyHostBrowser.setWindowBreakpoint('xs');

      expect(`#${screenshotElementId}`).toMatchBaselineScreenshot(done, {
        screenshotName: 'progress-indicator-horizontal-xs'
      });
    });
  });

  describe('Passive mode', function () {
    const screenshotElementId = 'app-screenshot-passive-mode';

    beforeEach(function () {
      SkyHostBrowser.moveCursorOffScreen();
      SkyHostBrowser.scrollTo(`#${screenshotElementId}`);
    });

    it('should match previous screenshot', function (done) {
      expect(`#${screenshotElementId}`).toMatchBaselineScreenshot(done, {
        screenshotName: 'progress-indicator-passive'
      });
    });

    it('should match previous screenshot (xs)', function (done) {
      SkyHostBrowser.setWindowBreakpoint('xs');

      expect(`#${screenshotElementId}`).toMatchBaselineScreenshot(done, {
        screenshotName: 'progress-indicator-passive-xs'
      });
    });
  });

  describe('Horizontal mode (modal)', function () {
    beforeEach(function () {
      performClick('#app-screenshot-open-modal-button');
      performClick('#app-screenshot-modal-next-button');
    });

    it('should match previous screenshot', function (done) {
      expect(`.sky-modal`).toMatchBaselineScreenshot(done, {
        screenshotName: 'progress-indicator-modal'
      });
    });

    it('should match previous screenshot (xs)', function (done) {
      SkyHostBrowser.setWindowBreakpoint('xs');

      expect(`.sky-modal`).toMatchBaselineScreenshot(done, {
        screenshotName: 'progress-indicator-modal-xs'
      });
    });
  });
});
