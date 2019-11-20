import { Column } from '../models/Column';
import * as Helper from './helper';

export const StrToColumnObject = (str: string): Column => {
    const col: Column = { name: null };
    str = Helper.removeLineBreaks(str);
    let comments = Helper.extractComments(str);

    for(let i = 0; i < comments.length; i++) {
        if(Helper.isIndicator(comments[i])) {
            col.isIndicator = true;
        } else {
            col.comment = Helper.cleanComment(comments[i]);
        }
    }

    str = Helper.removeComments(str);
    
    const words = str.split(/[ ]+/); // split on white spaces

    for(let i = 0; i < words.length; i++) {
        // if the word is empty then skip it
        if(words[i] === "") continue;

        // remove white spaces
        words[i] = words[i].trim();
        if(!col.name) {
            // if it is not a comment and the column does not have a name yet, then set it
            col.name = words[i];
        } else {
            // it is not a comment and the column already has a name
            if(Helper.containsAsKeyword(words[i])) {
                // next word should be the alias;
                words[i+1] = words[i+1].trim();
                col.alias = words[i+1];
                i++;
            } else {
                // is not a comment and the column has a name already, so this is the alias
                col.alias = words[i];
            }
        }
    }

    // if it does not have an alias and has comment, go get the alias from the comment
    if(!col.alias && col.comment && col.comment.length > 0) {
        if(Helper.containsAsKeyword(col.comment)){
            const ws = col.comment.split(/[ ]+/); // split on white spaces
            for(let i = 0; i < ws.length; i++) {
                ws[i] = ws[i].trim();
                if(ws[i] === "" || Helper.containsAsKeyword(ws[i])) continue;
                col.alias = ws[i];
            }
        } else {
            // the comment does not have the AS keyword, nevertheless use it as an alias
            col.alias = col.comment;
        }
    }

    return col;
}