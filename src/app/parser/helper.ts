export const removeLineBreaks = (str: string): string => {
    return str.replace(/(\r\n|\n|\r)/gm, " ");
}

export const removeUnnecessaryWhiteSpaces = (str: string): string => {
    str = str.replace(/[\t]+/g, " "); // replace tabs with white space
    str = str.replace(/[ ]+/g, " "); // remove successive white spaces;
    return str.trim();
}

export const containsAsKeyword = (str: string): boolean => {
    const regex = RegExp(/(^as$|^as | as )/i);
    return regex.test(str);
}

export const splitOnASKeyword = (str: string): string[] => {
    return str.split(/( as )/i);
}

export const isComment = (str:string): boolean => {
    const regex = RegExp(/^[/*].*[*/]$/);
    return regex.test(str);
}

export const cleanComment = (str: string): string => {
    return str.replace(/(^\/\*|\*\/$)/g, "").trim();
}

export const extractComments = (str:string): string[] => {
    const matches = str.match(/\/\*.*?\*\//g);
    return (matches) ? matches: [];
}

export const removeComments = (str:string): string => {
    return str.replace(/\/\*.*?\*\//g, " ");
}

export const isIndicator = (str:string): boolean => {
    const regex = RegExp(/!#/);
    return regex.test(str);
}