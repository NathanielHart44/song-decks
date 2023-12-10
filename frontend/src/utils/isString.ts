import { CustomFile } from "src/components/upload";

export default function isString(file: CustomFile | string): file is string {
    return typeof file === 'string';
};