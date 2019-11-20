import { SQLQueryRepresentation } from './SQLQueryRepresentation';

export class SITRepresentation {
    public ODS: SQLQueryRepresentation;
    public DW: SQLQueryRepresentation;
    public table: string;
    public validationIndicator: string;
    public fields: string;

    constructor() {
        this.ODS = new SQLQueryRepresentation("R_ODS");
        this.DW = new SQLQueryRepresentation("R_DW");
    }

    public generateTableName(): void {
        this.table = this.DW.sqlString.match(/(?<=from )\b.+?\b/i)[0];
    }

    public generateFields(): void {
        let fields = "";
        // fill in fields from alias of ODS
        fields += (this.ODS.columns[0].alias) ? this.ODS.columns[0].alias : this.ODS.columns[0].name;
        for(let i = 1; i < this.ODS.columns.length; i++) {
            const col = this.ODS.columns[i];
            let field = (col.alias) ? col.alias : col.name;
            fields += `;${field}`;
        }
        this.fields = fields;
    }

    public generateSITString(): string {
        let str = "";
        if(this.ODS.sqlString && this.ODS.sqlString.length > 0 && this.ODS.columns){
            this.generateFields();
            str += this.ODS.toSITQuery();
            str += '\n';
        }
        if(this.DW.sqlString && this.DW.sqlString.length > 0 && this.DW.columns){
            this.generateTableName();
            str += this.ODS.toSITQuery();
            str += '\n';
        }
        str += `table!${this.table}\n`;
        str += `field!${this.fields}\n`;
        str += `validation_indicator!${this.validationIndicator}`;

        return str;
    }
}