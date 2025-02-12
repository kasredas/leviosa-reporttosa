import { TestStats } from "@wdio/reporter";
import { mkdirSync, existsSync } from "fs";

class ReporterHelper {
  static dirForReport = process.env.TIMESTAMP ? process.env.TIMESTAMP : "0";

  static async getTestData(testStats: TestStats): Promise<[string, string]> {
    let errorLog = "";
    let errorImageBlock = "";

    if (testStats.state !== "passed") {
      errorLog = this.getErrorLog(testStats);
      errorImageBlock = this.getErrorImagePath(testStats);
    }

    return [errorLog, errorImageBlock];
  }

  private static getErrorLog(testStats: TestStats): string {
    return JSON.stringify(testStats.errors ?? []);
  }

  private static getErrorImagePath(testStats: TestStats): string {
    return `./screenshots/${this.convertTextToNoSpaces(testStats.title)}.png`;
  }

  static createReportDirIfNeeded(): void {
    const reportDir = `./reports/${this.dirForReport}`;
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir);
    }
  }

  static convertTextToNoSpaces(textToConvert: string): string {
    return textToConvert.replace(/\s/g, "_");
  }
}

export default ReporterHelper;
