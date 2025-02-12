import WDIOReporter, { TestStats as WDIOTestStats } from "@wdio/reporter";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import ReporterHelper from "./helper";
import { fileURLToPath } from "url";

interface ReporterOptions {
  outputDir?: string;
}

interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped" | "pending";
  logs?: string;
  failImagePath?: string;
  testSomething?: string;
}

export default class CustomReporter extends WDIOReporter {
  htmlTestBlock: string | undefined;
  currentDate = new Date();

  private testResults: TestResult[] = [];
  private resultsFilePath: string;
  private templatePath: string;
  private outputDir: string;

  constructor(options: any) {
    super(options);

    // Use provided outputDir or fallback to default
    this.outputDir = options.outputDir || join(process.cwd(), "reports");

    // Ensure outputDir exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }

    // Generate timestamp-based subdirectory if needed
    const timestamp = process.env.TIMESTAMP || Date.now().toString();
    const reportDir = join(this.outputDir, timestamp);

    // Create report directory
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }

    // Path for results file
    this.resultsFilePath = join(reportDir, "test-results.json");

    // Get the directory path of the current module
    const __dirname = dirname(fileURLToPath(import.meta.url));

    // Reference template from the package
    this.templatePath = join(__dirname, "templates", "template.html");

    this.loadExistingResults();
  }

  private loadExistingResults(): void {
    if (existsSync(this.resultsFilePath)) {
      try {
        const existingResults = JSON.parse(
          readFileSync(this.resultsFilePath, "utf-8")
        );
        this.testResults = Array.isArray(existingResults)
          ? existingResults
          : [];
      } catch (error) {
        console.error("Error loading existing results:", error);
      }
    }
  }

  async onTestEnd(testStats: WDIOTestStats): Promise<void> {
    ReporterHelper.createReportDirIfNeeded();

    const [errorLog, errorImageBlock] = await ReporterHelper.getTestData(
      testStats
    );

    this.testResults.push({
      name: `${testStats.fullTitle}`,
      status: testStats.state as "passed" | "failed" | "skipped" | "pending",
      logs: errorLog,
      failImagePath: errorImageBlock,
    });

    this.saveResults();
  }

  private saveResults(): void {
    try {
      writeFileSync(
        this.resultsFilePath,
        JSON.stringify(this.testResults, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Error saving test results:", error);
    }
  }

  async onRunnerEnd(): Promise<void> {
    // Console logging
    console.log("\n=== Test Execution Summary ===");
    console.log("-----------------------------");

    // Calculate statistics
    const totalTests = this.testResults.length;
    const stats = {
      passed: 0,
      failed: 0,
      skipped: 0,
      pending: 0,
    };

    // Print individual test results
    this.testResults.forEach((test, index) => {
      stats[test.status]++;
      const statusColor = this.getStatusColor(test.status);
      console.log(`${index + 1}. ${test.name}`);
      console.log(`   Status: ${statusColor}${test.status}\x1b[0m`);
    });

    // Print summary statistics
    console.log("\n=== Summary Statistics ===");
    console.log("------------------------");
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: \x1b[32m${stats.passed}\x1b[0m`);
    console.log(`Failed: \x1b[31m${stats.failed}\x1b[0m`);
    console.log(`Skipped: \x1b[33m${stats.skipped}\x1b[0m`);
    console.log(`Pending: \x1b[36m${stats.pending}\x1b[0m`);
    console.log("------------------------\n");

    // Generate HTML report
    const combinedHtml = this.generateHtmlReport();
    const outputPath = join(
      process.cwd(),
      `./reports/${ReporterHelper.dirForReport}/test-result.html`
    );

    try {
      writeFileSync(outputPath, combinedHtml, { flag: "w" });
      console.log(`Combined HTML report generated at: ${outputPath}`);
    } catch (error) {
      console.error("Error generating HTML report:", error);
    }
  }

  private getStatusColor(status: "passed" | "failed" | "skipped" | "pending"): string {
    const colors = {
      passed: "\x1b[32m",  // Green
      failed: "\x1b[31m",  // Red
      skipped: "\x1b[33m", // Yellow
      pending: "\x1b[36m"  // Cyan
    };
    return colors[status] || "\x1b[0m"; // Default to no color
  }

  private generateHtmlReport(): string {
    const reportBlocks = this.testResults
      .map((test) => this.generateReportBlock(test))
      .join("");

    const template = readFileSync(this.templatePath, "utf-8");
    return template.replace("{{reportBlocks}}", reportBlocks);
  }

  private generateReportBlock(test: TestResult): string {
    const safeTestName = ReporterHelper.convertTextToNoSpaces(test.name);

    return `
      <tr class='${test.status}'>
        <td class='center-align'>
          <span class='badge ${test.status}-status'>${test.status}</span>
        </td>
        <td class='is-wrap'>${test.name}</td>
        <td class=''>
          <a class='waves-effect waves-light btn modal-trigger ${
            test.status
          }-status' href='#modal_${safeTestName}'>Details</a>
          <div id='modal_${safeTestName}' class='modal'>
            <div class='modal-content'>
              <h4 class='is-break-word-on-overflow'>${test.name}</h4>
              <div class='divider'></div>
              <h5>Error</h5>
              <pre><code><p>${test.logs || "No errors"}</p></code></pre>
              <div class='divider'></div>
              <h5>Screenshot</h5>
              ${
                test.failImagePath
                  ? `<div><img src="${test.failImagePath}" alt="Error Screenshot" class='materialboxed responsive-img' style="max-width: 100%; border: 1px solid #ccc; margin-top: 10px;" /></div>`
                  : "No screenshot available"
              }
              <div class='divider'></div>
              <h5>Logs</h5>
              <pre>${
                test.logs ? `<code>${test.logs}</code>` : "No logs available"
              }</pre>
            </div>
            <div class='modal-footer'>
              <a href='#!' class='modal-close waves-effect waves-green btn-flat'>Close</a>
            </div>
          </div>
        </td>
      </tr>
    `;
  }
}
