import * as fs_old_school from "fs";
const fs = fs_old_school.promises;

import { ReportData, Constants } from './lib/types';
import { get_report_data } from "./lib/data";
import { create_report } from "./lib/html";


async function main() {
    const report_data: ReportData = await get_report_data(Constants.TESTS_DIR, Constants.TEST_RESULTS_DIR);
    const {implementations, results} = create_report(report_data);
    await fs.writeFile(Constants.IMPL_FRAGMENT, implementations, 'utf-8');
    await fs.writeFile(Constants.RESULT_FRAGMENT, results, 'utf-8');
}

main();
