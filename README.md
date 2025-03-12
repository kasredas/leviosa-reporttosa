

![Alt text](/screenshot.png?raw=true "Optional Title")

# Setup
add to `wdio.conf.ts`

### Start using reporter:
```
  reporters: [
   [
     'leviosa-reporttosa-reporter',
     {
       outputDir: './reports',
     },
   ],
 ],
```


### Add config  for screenshots on test failure:

```

  beforeTest: async () => {
    const browser: Browser = global.browser;
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    await browser.setWindowSize(1920, 1080);
  },

  afterTest: async function (test, context, { error, passed }) {
    if (!passed) {
      console.log('Test failed, taking screenshot');
      try {
        const testName = test.title.replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = process.env.TIMESTAMP;
        const screenshotPath = join(
          process.cwd(),
          'reports',
          `${timestamp}`,
          'screenshots',
          `${testName}.png`
        );

        const browser: Browser = global.browser;
        await browser.saveScreenshot(screenshotPath);
      } catch (err) {
        console.error('Failed to take screenshot:', err);
      }
    }
  },

```

