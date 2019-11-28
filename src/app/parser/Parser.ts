import * as Helper from './helper';
import * as ColumnParser from './ColumnParser';
import { Column } from '../models/Column';
import { NoAliasError } from '../errors/NoAliasError';

// export const extractODSStringFromSITString = (str: string): string => {

// }

// export const extractSITRepresentationFromSITString = (str: string): SITRepresentation => {

// }

export const cleanSQLString = (str: string): string => {
    // remove line breaks
    let result = Helper.removeLineBreaks(str);
    // remove comments
    result = Helper.removeComments(result);
    // remove ; at the end of the query
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
    let fullColumnName = "";

    // split on commas that are not directly between brackets. There is no way to avoid commas inside double brackets
    // e.g. trim(NVL(something[,]))
    const columnStrings = str.split(/,(?![^\(]*\))/);
    for(let i = 0; i < columnStrings.length; i++) {
        let columnString = columnStrings[i];
        if(columnString === "") continue; // if empty, skip it

        fullColumnName += " " + columnString;
        if(!Helper.containsAsKeyword(columnString)) {
            // The column string is not finished yet, as there is no "AS" keyword yet;
            continue;
        } 
        const col = ColumnParser.StrToColumnObject(fullColumnName);
        if(col.isIndicator || indicatorsFlag){
            indicatorsFlag = true;
            indicators.push(col);
        } else {
            columns.push(col);
        }
        fullColumnName = "";
    }

    if(fullColumnName != "") throw new NoAliasError(fullColumnName);

    return {columns, indicators};
}

export const parseStringToColumnsAndIndicators = (str: string): {columns: Column[], indicators: Column[]} => {
    // get the string between the first select .... from
    const extractedColumnsString = extractColumnsStringFromSQL(str);
    const columnsAndIndicators = buildColumnsFromColumnsString(extractedColumnsString);
    return columnsAndIndicators;
}

export const columnsToSITString = (columns: Column[], columnName: string): string => {
    let str = `${columns[0].name}`; 
    str += (columns[0].comment) ? ` /*${columns[0].comment}*/` : '';
    for(let i = 1; i < columns.length; i++) {
        str += ` || ';' || ${columns[i].name}`; 
        str += (columns[1].comment) ? ` /*${columns[1].comment}*/` : '';
    }
    return str + ` AS ${columnName}`;
}