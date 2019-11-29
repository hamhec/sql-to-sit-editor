import {Column} from './Column';
import * as Parser from '../parser/Parser';

export class SQLQueryRepresentation {
    public sqlString?: string;
    public DBName: string;
    public columns?: Column[];
    public indicators?: Column[];

    constructor(db: string) {
        this.DBName = db;
    }

    public initialize(sqlString: string) {
        this.sqlString = Parser.cleanSQLString(sqlString);
        const {columns, indicators} = Parser.parseStringToColumnsAndIndicators(this.sqlString);
        this.columns = columns;
        this.indicators = indicators;
    }

    public toSITQuery(): string {
        let str = `${this.DBName}!SELECT `;
        str += Parser.columnsToSITString(this.columns, "cle");
        if(this.indicators.length === 0) {
            // no indicators have been added, use default value
            str += ", '1' AS val"
        } else {
            str += Parser.columnsToSITString(this.indicators, "val");
        }
        str += this.sqlString.match(/ from .*/i)[0];
        return str;
    }

    public generateSQLFromColumnsAndIndicators(table: string = undefined) {
        let sqlString = `SELECT ${this.columns[0].alias} AS ${this.columns[0].alias}`;

        for(let i = 1; i < this.columns.length; i++) {
            const col = this.columns[i];
            sqlString += `, ${col.alias} AS ${col.alias}`;
        }
        if(this.indicators.length > 0) {
            let col = this.indicators[0];
            sqlString += `, ${col.alias} AS ${col.alias}`;
            for(let i = 1; i < this.indicators.length; i++) {
                col = this.indicators[i];
                sqlString += `, ${col.alias} AS ${col.alias}`;
            }
        }

        sqlString += ` FROM ${table}`
        this.sqlString = Parser.cleanSQLString(sqlString);
    }
}