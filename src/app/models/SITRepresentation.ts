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
        this.validationIndicator = "is_present";
    }

    public generateDWFromODS() {
        this.DW.columns = [];
        this.DW.indicators = [];
        for(let i = 0; i < this.ODS.columns.length; i++) {
            const col = this.ODS.columns[i];
            this.DW.columns.push({ name: col.alias, alias: col.alias, isIndicator: false});
        }
        for(let i = 0; i < this.ODS.indicators.length; i++) {
            const col = this.ODS.indicators[i];
            this.DW.indicators.push( { name: col.alias, alias: col.alias, isIndicator: true});
        }
        this.DW.generateSQLFromColumnsAndIndicators(this.table);
    }

    public generateTableName(): void {
        console.log(this.table);
        console.log(this.DW.sqlString);
        if(!this.table || this.table.trim() == "") {
          const matches = this.DW.sqlString.match(/(?<=from )\b.+?(\b|$)/im);
          this.table = (matches) ? matches[0]: undefined;
        }
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
        this.fields = `${fields};ODS_present;DWH_present;valid`;
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
            str += this.DW.toSITQuery();
            str += '\n';
        }
        str += `table!${this.table}\n`;
        str += `field!${this.fields}\n`;
        str += `validation_indicator!${this.validationIndicator}`;

        return str;
    }
}