/**
 * Module to extract and gather information necessary to produce the right reports and an overview page for test cases
 * 
 * @packageDocumentation
 */


import * as fs_old_school from "fs";
const fs = fs_old_school.promises;
import * as xml2js from "xml2js";

import { TestData, ImplementationReport, ImplementationData, ImplementationTable, Implementer, ReportData } from './types';

/** 
 * Name tells it all...
 * 
 * @internal 
 */
function string_comparison(a: string, b: string): number {
    if (a < b) return -1;
    else if (a > b) return 1;
    else return 0;
}

/** 
 * See if a file name path refers to a real file (as opposed to a directory)
 * 
 * @internal 
 */
function isFile(name: string): boolean {
    return fs_old_school.lstatSync(name).isFile();
}

/**
 * Lists of a directory content
 * 
 * (Note: at this moment this returns all the file names. Depending on the final configuration some filters may have to be added.)
 * 
 * @param dir_name name of the directory
 * @param filter_name a function to filter the retrieved list (e.g., no directories)
 * @returns lists of files in the directory
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function get_list_dir(dir_name: string, filter_name: (name: string) => boolean = (name: string) => true): Promise<string[]> {
    // The filter works on the full path, hence this internet
    const file_name_filter = (name: string): boolean => {
        return filter_name(`${dir_name}/${name}`);
    }
    const file_names = await fs.readdir(dir_name);
    return file_names.filter(file_name_filter)
}


/**
 * Get all the implementation reports.
 * The results are sorted using the implementation's name as a key.
 * 
 * @param dir_name the directory that contains the implementation reports
 */
async function get_implementation_reports(dir_name: string): Promise<ImplementationReport[]> {
    // Get a single implementation report, which must be a JSON file
    const get_implementation_report = async (file_name: string): Promise<ImplementationReport> => {
        const implementation_report = await fs.readFile(file_name, 'utf-8');
        return JSON.parse(implementation_report) as ImplementationReport;
    };

    // Use the 'Promise.all' trick to get to all the implementation reports in one async step rather than going through a cycle
    const implementation_list = await get_list_dir(dir_name, isFile);
    const report_list_promises: Promise<ImplementationReport>[] = implementation_list.map((file_name) => get_implementation_report(`${dir_name}/${file_name}`));
    const implementation_reports: ImplementationReport[] = await Promise.all(report_list_promises);
    implementation_reports.sort((a,b) => string_comparison(a.name, b.name));

    return implementation_reports
}


/**
 * Extract all the test information from all available tests
 * 
 * @param dir_name test directory name
 * @returns metadata converted into the [[TestData]] structure
 */
async function get_test_metadata(dir_name: string): Promise<TestData[]> {
    // Extract the metadata information from the tests' package file for a single test
    const get_single_test_metadata = async (file_name: string): Promise<TestData> => {
        const get_string_value = (label: string, fallback: string): string => {
            try {
                const entry = metadata[label][0];
                if (entry === undefined) {
                    return fallback;
                } else {
                    return typeof entry === "string" ? entry : entry._;
                }
            } catch {
                return fallback;
            }
        }
    
        const package_xml: string = await fs.readFile(`${file_name}/OPS/package.opf`,'utf-8');
        const package_js: any = await xml2js.parseStringPromise(package_xml, {
            trim          : true,
            normalizeTags : true,
            explicitArray : true,
        });
        const metadata = package_js.package.metadata[0]
    
        const alternate_title = metadata.meta.find((entry: any): boolean => entry["$"].property === "dcterms:alternative");
        const final_title = alternate_title === undefined ? get_string_value("dc:title", "(No title)") : alternate_title._;
    
        return {
            identifier  : get_string_value("dc:identifier", file_name.split('/').pop()),
            title       : final_title,
            description : get_string_value("dc:description", "(No description)"),
            coverage    : get_string_value("dc:coverage", "(Uncategorized)"),
            references  : metadata["meta"].filter((entry:any): boolean => entry["$"].property === "dcterms:isReferencedBy").map((entry:any): string => entry._),
        }
    }

    // Get the test descriptions
    const test_list = await get_list_dir(dir_name);
    const test_data_promises: Promise<TestData>[] = test_list.map((name: string) => get_single_test_metadata(`${dir_name}/${name}`));
    return await Promise.all(test_data_promises);
}


/**
 * Combine the metadata, as retrieved from the tests, and the implementation reports into 
 * one structure for each tests with the test run results included
 * 
 */
function create_implementation_data(metadata: TestData[], implementations: ImplementationReport[]): ImplementationData[] {
    return metadata.map((single_test: TestData): ImplementationData => {
        // Extend the object with, at first, an empty array of implementations
        const retval: ImplementationData = {...single_test, implementations: []};
        retval.implementations = implementations.map((implementor: ImplementationReport) => {
            if (single_test.identifier in implementor.tests) {
                return implementor.tests[single_test.identifier]
            } else {
                return undefined
            }
        });
        return retval;
    })
}


/**
 * Create Implementation tables: a separate list of implementations for each "section", ie, a collection of tests
 * that share the same `dc:coverage` data
 * 
 */
function create_implementation_tables(implementation_data: ImplementationData[]): ImplementationTable[] {
    const retval: ImplementationTable[] = [];

    for (const impl_data of implementation_data) {
        const header = impl_data.coverage;
        let section = retval.find((table) => table.header === header);
        if (section === undefined) {
            section = {
                header          : header,
                implementations : [impl_data],
            }
            retval.push(section)
        } else {
            section.implementations.push(impl_data)
        }
    }

    // Sort the results per section heading
    retval.sort( (a,b) => string_comparison(a.header, b.header));
    return retval;
}


/* ------------------------------------------------------------------------------------------------------ */
/*                                   External entry points                                                */
/* ------------------------------------------------------------------------------------------------------ */

/**
 * Get all the test reports and tests files metadata and create the data structures that allow a simple
 * generation of a final report
 * 
 * @param tests directory where the tests reside
 * @param reports directory where the implementation reports reside
 */
export async function get_report_data(tests: string, reports: string): Promise<ReportData> {
    // Get the metadata for all available tests;
    const metadata: TestData[] = await get_test_metadata(tests);

    // Get the list of available implementation reports
    const impl_list: ImplementationReport[] = await get_implementation_reports(reports);

    // Combine the two lists to create an array of Implementation data
    const implementation_data: ImplementationData[] = create_implementation_data(metadata, impl_list)

    // Section the list of implementation data
    const tables = create_implementation_tables(implementation_data)

    // Create an array of implementers that only contain the bare minimum
    const implementers = impl_list as Implementer[];

    return {tables, implementers}
}

/**
 * Get a list of the tests file names, to be used to generate a template report.
 * 
 * @param tests directory where the tests reside
 */
export async function get_template(tests: string): Promise<ImplementationReport> {
    const test_names: string[] = await get_list_dir(tests, isFile);
    const test_list: {[index: string]: boolean } = {};
    for (const name of test_names) {
        test_list[name] = false;
    }
    return {
        "name"  : "(Implementation's name)",
        "ref"   : "https://www.example.com",
        "tests" : test_list,
    }
}
