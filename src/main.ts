import { ReportData } from './lib/types';
import { get_report_data } from "./lib/data";
import { create_md_report } from "./lib/markdown";

async function main() {
    const report_data: ReportData = await get_report_data('tests', 'reports')
    // console.log(`Implementers:\n${JSON.stringify(report_data.implementers, null, 4)}`);
    // console.log(`Tables:\n${JSON.stringify(report_data.tables, null, 4)}`);
    const report_md = create_md_report(report_data);
    console.log(report_md);
}

main();
