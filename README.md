

![Report screenshot](https://github.com/kasredas/leviosa-reporttosa/raw/main/screenshot.png?raw=true "Report screenshot")

# Setup
Add to `wdio.conf.ts`

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


# Result
CLI will print this message:

```
 === Test Execution Summary ===
 -----------------------------
 1. Lorem ipsum test
    Status: failed
 
 === Summary Statistics ===
 ------------------------
 Total Tests: 1
 Passed: 0
 Failed: 1
 Skipped: 0
 Pending: 0
 ------------------------
 
 Combined HTML report generated at: /<your_project_path>/reports/<TIMESTAMP>/test-result.html
```

Alongside  generated html file that should look like one in screenshot
