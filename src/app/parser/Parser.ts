import * as Helper from './helper';
import * as ColumnParser from './ColumnParser';
import { Column } from '../models/Column';

export const cleanSQLString = (str: string): string => {
    let result = Helper.removeLineBreaks(str);
    result = result.replace(/;[ ]*$/, "");
    return result;
}

export const extractColumnsStringFromSQL = (str:string): string => {
    const matches = str.match(/(?<=select ).*?(?= from )/i);
    return matches[0];
}

export const buildColumnsFromColumnsString = (str: string): {columns: Column[], indicators: Column[]} => {
    const columns: Column[] = [];
    const indicators: Column[] = [];
    let indicatorsFlag = false;

    const columnStrings = str.split(/[,]+/);
    for(let i = 0; i < columnStrings.length; i++) {
        if(columnStrings[i] === "") continue;
        const col = ColumnParser.StrToColumnObject(columnStrings[i]);
        if(col.isIndicator || indicatorsFlag){
            indicatorsFlag = true;
            indicators.push(col);
        } else {
            columns.push(col);
        }
    }

    return {columns, indicators};
}

export const parseStringToColumnsAndIndicators = (str: string): {columns: Column[], indicators: Column[]} => {
    const extractedColumnsString = extractColumnsStringFromSQL(str);
    return buildColumnsFromColumnsString(extractedColumnsString);
}

export const columnsToSITString = (columns: Column[], columnName: string): string => {
    let str = `${columns[0].name} /*${columns[0].comment}*/`;
    for(let i = 1; i < columns.length; i++) {
        str += ` || ';' || ${columns[i].name} /*${columns[i].comment}*/`;
    }
    return str + ` AS ${columnName}`;
}