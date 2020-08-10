export class Converter {
    public stringToGraphQl(str: string): string {
        const res: string = str.replace(/ /gm, '').replace(/(\r\n|\n|\r)/gm, ' ');
        return res ? res : str;
    }
}