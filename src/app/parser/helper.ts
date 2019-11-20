export const removeLineBreaks = (str: string): string => {
    return str.replace(/(\r\n|\n|\r)/gm, " ");
}

export const containsAsKeyword = (str: string): boolean => {
    const regex = RegExp(/^(as$|as )/i);
    return regex.test(str);
}

export const isComment = (str:string): boolean => {
    const regex = RegExp(/^[/*].*[*/]$/);
    return regex.test(str);
}

export const cleanComment = (str: string): string => {
    return str.replace(/(^\/\*|\*\/$)/g, "").trim();
}

export const extractComments = (str:string): string[] => {
    return str.match(/\/\*.*?\*\//g);
}

export const removeComments = (str:string): string => {
    return str.replace(/\/\*.*?\*\//g, " ");
}

export const isIndicator = (str:string): boolean => {
    const regex = RegExp(/!#/);
    return regex.test(str);
}