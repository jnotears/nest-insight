export class Converter {
    public stringConverter(str: string): string {
        const res: string = str.replace(/(\r\n|\n|\r|\s)/gm, '');
        return res ? res : str;
    }
}