# Setup

add to `wdio.conf.ts`

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

```

beforeTest: async function (test, context) {
const screenshotsDir = join(
'./reports',
process.env.TIMESTAMP || '',
'screenshots'
);

    mkdirSync(screenshotsDir, { recursive: true });

},

afterTest: async function (test, { passed }) {
if (!passed) {
const timestamp = process.env.TIMESTAMP;
const testName = test.title.replace(/\s/g, '\_');
const screenshotPath = `./reports/${timestamp}/screenshots/${testName}.png`;

      await driver.saveScreenshot(screenshotPath);
    }

},

```

