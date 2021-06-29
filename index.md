# Implementation Report

(this is only a test output, nothing based on real data!)
## Implementers

* [ACME Books](https://www.example.org/acme)
* Cicada Reader
* [Olive reader](https://www.example.org/olive)
* [Sea Reader](https://www.example.org/sea)
## Test results



### Core Media Types

| Test id | Test Title | References |ACME Books | Cicada Reader | Olive reader | Sea Reader|
| ------- | ---------- | ---------- | :----: | :----: | :----: | :----:|
| cmt-gif | Using a gif image as media type | [(1)](https://www.w3.org/TR/epub-33/#sec-cmt-supported), [(2)](https://www.w3.org/TR/epub-rs-33/#sec-epub-rs-conf-cmt) | true | true | true | true |
| cmt-jpeg | Using a jpeg image as media type | [(1)](https://www.w3.org/TR/epub-33/#sec-cmt-supported), [(2)](https://www.w3.org/TR/epub-rs-33/#sec-epub-rs-conf-cmt) | true | true | true | true |

### Internationalization features

| Test id | Test Title | References |ACME Books | Cicada Reader | Olive reader | Sea Reader|
| ------- | ---------- | ---------- | :----: | :----: | :----: | :----:|
| package-title-dir-rtl-001 | Correct base direction setting on the element | [(1)](https://www.w3.org/TR/epub-33/#attrdef-dir), [(2)](https://www.w3.org/TR/epub-rs-33/#sec-pkg-doc-base-dir) | false | true | false | true |
| package-title-dir-rtl-002 | No base direction setting on the element (default is auto) | [(1)](https://www.w3.org/TR/epub-33/#attrdef-dir), [(2)](https://www.w3.org/TR/epub-rs-33/#sec-pkg-doc-base-dir) | false | n/a | false | true |
| package-title-dir-rtl-003 | Incorrect base direction setting of 'auto' on the element | [(1)](https://www.w3.org/TR/epub-33/#attrdef-dir), [(2)](https://www.w3.org/TR/epub-rs-33/#sec-pkg-doc-base-dir) | false | n/a | false | true |
| package-title-dir-rtl-004 | The element inherits the correct base direction setting ('rtl') from the root. | [(1)](https://www.w3.org/TR/epub-33/#attrdef-dir), [(2)](https://www.w3.org/TR/epub-rs-33/#sec-pkg-doc-base-dir) | false | true | false | true |
