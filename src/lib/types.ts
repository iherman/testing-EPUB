// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Constants {
    export const TESTS_DIR: string = 'tests';
    export const TEST_RESULTS_DIR: string = 'results';
    export const TEST_URL_BASE: string = 'https://github.com/w3c/epub-tests/tree/main/tests';
    export const IMPL_FRAGMENT: string = 'reports/implementations.html';
    export const RESULT_FRAGMENT: string = 'reports/results.html';
}

/**
 * The metadata related to a single test, extracted from the test's package document
 * and reused by the reporting
 */
export interface TestData {
    /**
     * Unique identifier (usually the file name)
     */
    identifier: string;
    /**
     * Short title of the test
     */
    title: string;
    /**
     * Description of the test
     */
    description: string;
    /**
     * "Coverage" of the test, ie, the broad area that the test belongs to
     */
    coverage: string;
    /**
     * This is a series of URL strings, referring to the section in the spec this test is pertinent to.
     */
    references: string[];
}

/**
 * Data about a single implementer: essentially, the data that is necessary to the final report about each implementer
 */
export interface Implementer {
    /** Name of the implementation to appear in the final report */
    name: string;
    /** If present, the name becomes a hyperlink to this URL */
    ref?: string
}

/**
 * The report of each implementer: beyond the data about the implementation itself it includes an object listing
 * tests results, one for each test that has been run.
 */
export interface ImplementationReport extends Implementer {
    tests: {
       [index: string]: boolean; 
    }
}


/**
 * The information about a single tests: the original metadata extended with an
 * array of true/false values on whether the implementation passes the test or not. 
 * The order of the test results is in sync with the order of extracted implementations.
 */
export interface ImplementationData extends TestData {
    /**
     * The array of implementation flags for this test
     */
    implementations: boolean[];
}


/**
 * A single set ("table") of implementations, grouped as one "section" (using the "coverage" value in the tests)
 */
export interface ImplementationTable {
    header: string;
    implementations: ImplementationData[];
}


/**
 * Data needed for the display of the test results
 */
export interface ReportData {
    tables: ImplementationTable[],
    implementers : Implementer[]
} 
