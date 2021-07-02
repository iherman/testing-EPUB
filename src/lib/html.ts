import { ReportData, ImplementationTable, Implementer, ImplementationData, Constants } from './types';

import * as xml2js from "xml2js";
const builder = new xml2js.Builder({
    headless : true,
});

/**
 * Turn a text into a string that can be used as an ID
 */
const convert_to_id = (header: string): string => {
    return header.toLowerCase().replace(' ', '-');
}


/**
 * Create the list of implementation: a simple set of numbered items, with the name and (possible) reference to the implementation site.
 * @param impl 
 * @returns results in XML format
 */
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

/**
 * Create one result table: ie, the table with a fixed head and then a series of rows, one for each test.
 * 
 * @returns an array of objects to represent the content of the table as JS Objects
 */
function create_one_result_table(data: ImplementationTable, implementers: Implementer[]): any[] {
    const fixed_head = ["Id"];
    const variable_head = implementers.map((impl) => impl.name);
    const head = [...fixed_head,...variable_head].map((title) => {
        return { th: title}
    });

    // Creation of an array of regular rows
    const tests = data.implementations.map((row: ImplementationData): any[] => {
        // Creation of one row for a specific test, ie, an array of 'td' elements
        // The row consists of the test (meta)data, and the list of test results

        // Fist the test metadata (currently the ID only); ...
        const test_data = [
            {
                td : {
                    $ : {
                        id : `${row.identifier}-results`,
                    },
                    a : {
                        $ : {
                            href : `${Constants.DOC_TEST_DESCRIPTIONS}#${row.identifier}`,
                        },
                        _ : row.identifier,
                    },
                },
            },
        ];

        // ...followed by the test results themselves
        const test_results = row.implementations.map((result) => {
            if (result === undefined) {
                return {td: "n/a"}
            } else {
                const text = result ? Constants.CLASS_PASS : Constants.CLASS_FAIL;
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
        // This is one regular row
        return [...test_data, ...test_results]
    });

    // Combine the two for the full table content
    return [...[head], ...tests];
}

/**
 * Create a series of sections with implementation tables
 * @returns Serialized XML
 */
function create_impl_reports(data: ReportData): string {
    const root: any = {
        section : {
            h2 : {
                $ : {
                    id : "sec-report-tables",
                },
                _ : "Implementation Results",
            },

            // One (sub)section for each test category
            section : data.tables.map((table): any => {
                return {
                    h2 : {
                        $ : {
                            id : `sec-${convert_to_id(table.header)}-results`,
                        },
                        _ : table.header,
                    },

                    // The table itself is created by adding the rows for each test
                    table : {
                        $ : {
                            class : "zebra",
                        },
                        colgroup : {
                            col : {
                                $ : {
                                    class : Constants.CLASS_COL_ID,
                                },
                            },
                        },
                        tr : create_one_result_table(table, data.implementers),
                    },
                }
            }),
        },
    };
    return builder.buildObject(root);
}

/**
 * Create one test table: ie, the table with a fixed head and then a series of rows, one for each test.
 * 
 * @returns an array of objects to represent the content of the table
 */
function create_one_test_table(data: ImplementationTable): any[] {
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
    // const fixed_head = ["Test id", "Test", "References"];
    const fixed_head = ["Id", "Title", "Description", "Specs", "Ref"];
    const head = fixed_head.map((title) => { return { th: title} });

    // Creation of an array of regular rows
    const tests = data.implementations.map((row: ImplementationData): any[] => {
        // Creation of one row for a specific test, ie, an array of 'td' elements
        // Fist the test metadata (currently the ID only); ...
        return [
            {
                td : {
                    $ : {
                        id : `${row.identifier}`,
                    },
                    a : {
                        $ : {
                            href : `${Constants.TESTS_DIR}/${row.identifier}`,
                        },
                        _ : row.identifier,
                    },
                },
            },
            {
                td : row.title,
            },
            {
                td : row.description,
            },
            {
                td : reference_list(row.references),
            },
            {
                td : {
                    a : {
                        $ : {
                            href : `${Constants.DOC_TEST_RESULTS}#${row.identifier}-results`,
                        },
                        _ : "❐",
                    },
                },
            },
        ];
    });

    // Combine the two for the full table content
    return [...[head], ...tests];
}

/**
 * Create the test (meta) data table
 * @param data 
 * @returns results in XML format
 */
function create_test_data(data: ReportData): string {
    const root: any = {
        section : {
            h2 : {
                $ : {
                    id : "sec-test-tables",
                },
                _ : "Description of the Tests",
            },

            // One (sub)section for each test category
            section : data.tables.map((table): any => {
                return {
                    h2 : {
                        $ : {
                            id : `sec-${convert_to_id(table.header)}-data`,
                        },
                        _ : table.header,
                    },

                    // The table itself is created by adding the rows for each test
                    table : {
                        $ : {
                            class : "zebra",
                        },
                        colgroup : {
                            col : [
                                {
                                    $ : {
                                        class : Constants.CLASS_COL_ID,
                                    },
                                },
                                {
                                    $ : {
                                        class : Constants.CLASS_COL_TITLE,
                                    },
                                },
                                {},
                                {
                                    $ : {
                                        class : Constants.CLASS_COL_SREF,
                                    },
 
                                },
                                {
                                    $ : {
                                        class : Constants.CLASS_COL_TREF,
                                    },
                                },
                            ],
                        },
                        tr : create_one_test_table(table),
                    },
                }
            }),
        },
    };
    return builder.buildObject(root);
}


export function create_report(data: ReportData): {implementations: string, results: string, tests: string} {
    return {
        implementations : create_impl_list(data.implementers),
        results         : create_impl_reports(data),
        tests           : create_test_data(data),
    }
}

