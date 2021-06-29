import { ReportData, Implementer, ImplementationTable } from './lib/types';
import { get_report_data } from "./lib/data"

async function main() {
    const report_data: ReportData = await get_report_data('tests', 'reports')
    console.log(`Implementers:\n${JSON.stringify(report_data.implementers, null, 4)}`);
    console.log(`Tables:\n${JSON.stringify(report_data.tables, null, 4)}`);
}

main();
