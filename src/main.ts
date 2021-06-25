import * as fs from "fs";
import * as xml2js from "xml2js";

interface TestData {
    identifier: string;
    title: string;
    description: string;
    references: string[];
}


async function main() {
    const get_string_value = (label: string): string => {
        const entry = metadata[label][0];
        return typeof entry === "string" ? entry : entry._;
    }


    const package_xml: string = fs.readFileSync('tests/package-title-dir-rtl-001/OPS/package.opf','utf-8');
    const package_js: any = await xml2js.parseStringPromise(package_xml, {
        trim          : true,
        normalizeTags : true,
        explicitArray : true
    });
    const metadata = package_js.package.metadata[0]
    // console.log(JSON.stringify(metadata, null, 4));

    const alternate_title = metadata.meta.find((entry: any): boolean => entry["$"].property === "dcterms:alternative");
    const final_title = alternate_title === undefined ? get_string_value("dc:title") : alternate_title._;

    const test_data: TestData = {
        identifier: get_string_value("dc:identifier"),
        title : final_title,
        description: get_string_value("dc:description"),
        references: metadata["meta"].filter((entry:any): boolean => entry["$"].property === "dcterms:isReferencedBy").map((entry:any): string => entry._)
    }

    console.log(JSON.stringify(test_data, null, 4));


}


main();
