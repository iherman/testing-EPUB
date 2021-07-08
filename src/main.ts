import * as fs_old_school from "fs";
const fs = fs_old_school.promises;

import { ReportData, ImplementationReport, Constants } from './lib/types';
import { get_report_data, get_template } from "./lib/data";
import { create_report } from "./lib/html";


async function main() {
    // const report_data: ReportData = await get_report_data(Constants.TESTS_DIR, Constants.TEST_RESULTS_DIR);
    // const template: ImplementationReport = await get_template(Constants.TESTS_DIR);

    const [ report_data, template ] = await Promise.all([
        get_report_data(Constants.TESTS_DIR, Constants.TEST_RESULTS_DIR),
        get_template(Constants.TESTS_DIR),
    ])

    const {implementations, results, tests} = create_report(report_data);
    
    await Promise.all([
        fs.writeFile(Constants.IMPL_FRAGMENT, implementations, 'utf-8'),
        fs.writeFile(Constants.RESULT_FRAGMENT, results, 'utf-8'),
        fs.writeFile(Constants.TEST_FRAGMENT, tests, 'utf-8'),
        fs.writeFile(Constants.TEST_RESULTS_TEMPLATE, JSON.stringify(template, null, 4)),
    ]);
}

main();
