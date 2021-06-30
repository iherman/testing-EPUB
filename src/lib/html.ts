import { ReportData, ImplementationTable, Implementer, ImplementationData, Constants } from './types';

import * as xml2js from "xml2js";
const builder = new xml2js.Builder({
    headless : true,
});


function create_impl_list(impl: Implementer[]): string {
    const root: any = {
        section : {
            h2 : {
                $ : {
                    id : "sec-implementer-list",
                },                    
                _ : "List of Implementations",
            },
            ol : {
            },
        },
    }

    root.section.ol.li = impl.map((implementer: Implementer): any => {
        if ('ref' in implementer) {
            return {
                a : {
                    $ : {
                        href : implementer.ref,
                    },
                    _ : implementer.name,
                },    
            }
        } else {
            return implementer.name
        }
    }); 


    return builder.buildObject(root)
}

// eslint-disable-next-line max-lines-per-function
function create_one_table(data: ImplementationTable, implementers: Implementer[]): any[] {
    const reference_list = (refs: string[]): any => {
        if (refs.length === 0) {
            return " ";
        } else {
            let counter = 0;
            return refs.map((ref:string) => {
                counter += 1;
                return {
                    a : {
                        $ : {
                            href : ref,
                        },
                        _ : `(${counter}) `,
                    },
                }
            } )
        }
    }

    // Creation of the header row
    const fixed_head = ["Test id", "Test", "References"];
    const variable_head = implementers.map((impl) => impl.name);
    const head = [...fixed_head,...variable_head].map((title) => {
        return { th: title}
    });

    // Creation of an array of regular rows
    const tests = data.implementations.map((row: ImplementationData): any[] => {
        // Creation of one row for a specific test, ie, an array of 'td' elements
        // The row consists of the test (meta)data, and the list of test results
        const test_data = [
            {
                td : {
                    a : {
                        $ : {
                            href : `${Constants.TESTS_DIR}/${row.identifier}`,
                        },
                        _ : row.identifier,
                    },
                },
            },
            {
                td : {
                    details : {
                        summary : {
                            _ : row.title,
                        },
                        _ : row.description,
                    },
                },
            },
            {
                td : reference_list(row.references),
            },
        ];
        const test_results = row.implementations.map((result) => {
            if (result === undefined) {
                return {td: "n/a"}
            } else {
                const text = result ? "pass" : "fail";
                return {
                    td : {
                        $ : {
                            class : text,
                        },
                        _ : text,
                    },
                }
            }
        })
        return [...test_data, ...test_results]
    });

    // Combine the two for the full table content
    return [...[head], ...tests];
}


function create_impl_reports(data: ReportData): string {
    const convert_to_id = (header: string): string => {
        return header.toLowerCase().replace(' ', '-');
    }
    const root: any = {
        section : {
            h2 : {
                $ : {
                    id : "sec-report-tables",
                },
                _ : "Implementation Results",
            },
            section : data.tables.map((table): any => {
                return {
                    h2 : {
                        $ : {
                            id : `sec-${convert_to_id(table.header)}`,
                        },
                        _ : table.header,
                    },
                    table : {
                        $ : {
                            class : "zebra",
                        },
                        tr : create_one_table(table, data.implementers),
                    },
                }
            }),
        },
    };

    // console.log(JSON.stringify(root, null, 4))

    return builder.buildObject(root);
}


export function create_report(data: ReportData): {implementations: string, results: string} {
    return {
        implementations : create_impl_list(data.implementers),
        results         : create_impl_reports(data),
    }
}

