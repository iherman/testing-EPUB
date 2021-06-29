
import { ReportData, ImplementationTable, Implementer, ImplementationData } from './types';

export function create_md_report(data: ReportData): string {
    const retval: string[] = ['# Implementation Report'];
    retval.push("\n(this is only a test output, nothing based on real data!)");

    // Get the list of implementers
    retval.push("## Implementers\n")
    for (const implementer of data.implementers) {
        if ("ref" in implementer) {
            retval.push(`* [${implementer.name}](${implementer.ref})`);
        } else {
            retval.push(`* ${implementer.name}`);
        }
    }

    // Collect the header part to the table from the implementers' list
    const names = data.implementers.map((impl: Implementer): string => impl.name).join(' | ');
    const separators = data.implementers.map((): string => ":----:").join(' | ');

    const table_header = `| Test id | Test Title | References |${names}|`;
    const table_subheader = `| ------- | ---------- | ---------- | ${separators}|`

    // Get a section for each test category
    retval.push('## Test results\n\n')

    for (const section of data.tables ) {
        retval.push(`\n### ${section.header}\n`);
        retval.push(table_header);
        retval.push(table_subheader);
        for (const test of section.implementations) {
            const test_result: string = test.implementations.map((result) => {
                if (result === undefined) {
                    return "n/a"
                } else {
                    return `${result}`
                }
            }).join(' | ');
            let ref_counter = 0;
            const references: string = test.references.map((ref: string): string => {
                ref_counter += 1;
                return `[(${ref_counter})](${ref})`
            }).join(', ');
            const line = `| ${test.identifier} | ${test.title} | ${references} | ${test_result} |`
            retval.push(line);
        }
    }
    return retval.join('\n');
}
