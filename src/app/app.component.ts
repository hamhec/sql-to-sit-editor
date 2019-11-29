import { Component, OnInit, ViewChild, ElementRef, Query } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ElectronService } from 'ngx-electron';
import { FsService } from 'ngx-fs';

import sqlFormatter from 'sql-formatter';
import * as sqlParser from 'js-tsql-parser';

import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-sql';

import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-sqlserver';


import { SITRepresentation } from './models/SITRepresentation';
import { ErrorDialogComponent } from './errors/error-dialog/error-dialog.component';
import { FileService } from './services/file.service';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';

const THEME = 'ace/theme/sqlserver';
const LANG = 'ace/mode/sql';
const FONTSIZE = '12px';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('codeEditor1', {static: true}) firstCodeEditorElmRef: ElementRef;
  @ViewChild('codeEditor2', {static: true}) secondCodeEditorElmRef: ElementRef;
  @ViewChild('codeEditor3', {static: true}) outputCodeEditorElmRef: ElementRef;
  public firstCodeEditor: ace.Ace.Editor;
  public secondCodeEditor: ace.Ace.Editor;
  public outputCodeEditor: ace.Ace.Editor;

  public SITRepresentation = new SITRepresentation();

  constructor(private matDialog: MatDialog, private fs: FsService, private elec: ElectronService) {}

  ngOnInit() {
    ace.require('ace/ext/language_tools');
    const editorOptions = this.getEditorOptions();
    this.firstCodeEditor = this.initializeEditor(this.firstCodeEditorElmRef, editorOptions);
    this.secondCodeEditor = this.initializeEditor(this.secondCodeEditorElmRef, editorOptions);
    this.outputCodeEditor = this.initializeEditor(this.outputCodeEditorElmRef, editorOptions);
  }

  private initializeEditor(editorElmRef: ElementRef, options): ace.Ace.Editor {
    const editor = ace.edit(editorElmRef.nativeElement, options);
    editor.setTheme(THEME);
    editor.setFontSize(FONTSIZE);
    editor.getSession().setMode(LANG);
    editor.setShowFoldWidgets(true);
    return editor;
  }

  private getEditorOptions(): Partial<ace.Ace.EditorOptions> & { enableLiveAutocompletion?: boolean; } {
    // missing propery on EditorOptions 'enableBasicAutocompletion' so this is a walkaround.
    const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      hScrollBarAlwaysVisible: true,
      vScrollBarAlwaysVisible: true,
      showPrintMargin: false
    };

    const extraEditorOptions = {
      // Set autocompletion to false because it slows down the app
      enableLiveAutocompletion: true
    };
    return Object.assign(basicEditorOptions, extraEditorOptions);
  }


  public onBeautifyContent(editor: ace.Ace.Editor) {
    let code = editor.getValue();
    // format the code then move the cursor to the end
    editor.setValue(sqlFormatter.format(code), 1);
  }

  public onRedo(editor: ace.Ace.Editor) {
    editor.redo();
  }

  public onUndo(editor: ace.Ace.Editor) {
    editor.undo();
  }

  public onClearContent(editor: ace.Ace.Editor) {
    // deletes the content and moves the cursor to the beginning
    editor.setValue("", -1);
  }

  public onWrapContent(editor: ace.Ace.Editor) {
    let wrap = editor.getSession().getUseWrapMode();
    editor.getSession().setUseWrapMode(!wrap);
  }

  public onCopyContent(editor: ace.Ace.Editor) {
    var selection = editor.selection.toJSON(); // save selection
    editor.selectAll();
    editor.focus();
    document.execCommand('copy');
    editor.selection.fromJSON(selection); // restore selection
  }

  onImportFromFile($event, editor: ace.Ace.Editor) {
    if(!$event.srcElement.value) return;
    let file = $event.srcElement.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (data) => {
      let txt = reader.result.toString();
      editor.setValue(txt, 1);
      $event.srcElement.value = null;
    }
  }

  async onExportToFile(editor: ace.Ace.Editor, name: string) {
    const defaultPath = `~/${name}`;
    const data = editor.getValue();  
    console.log(defaultPath);
    console.log(data);
    const options = {
      title: "Save file",
      buttonLabel: "Save",
      defaultPath
    }
    let {filePath} = await this.elec.remote.dialog.showSaveDialog(options);
      (<any>this.fs.fs).writeFile(filePath, data, e => {
        console.log(e);
      });
  }

  generateSIT() {
    let ODScode = this.firstCodeEditor.getValue();
    try {
      this.SITRepresentation.ODS.initialize(ODScode);
    } catch (e) {
      console.log(e);
      if(e instanceof TypeError || e instanceof ReferenceError) {
        this.showError("Warning! SQL Error in ODS query", 
          "The SQL query is valid. However, it does not follow the syntax agreed upon.\n Please check the columns in the first SELECT.");
      } else {
        this.showError("Warning! SQL Error in ODS query", e.message);
      }
    }

    let DWcode = this.secondCodeEditor.getValue();
    // Generate DWcode if it has not been set
    if(DWcode == "") {
      this.SITRepresentation.generateDWFromODS();
      this.secondCodeEditor.setValue(sqlFormatter.format(this.SITRepresentation.DW.sqlString), 1);
      
    } else {
      try{
        // sqlParser.parse(DWcode);
        this.SITRepresentation.DW.initialize(DWcode);
      } catch (e) {
        console.log(e);
        if(e instanceof TypeError || e instanceof ReferenceError) {
          this.showError("Warning! SQL Error in DW query", 
            "The SQL query does not follow the syntax agreed upon.\n Please check the help section.");
        } else {
          this.showError("Warning! SQL Error in DW query", e.message);
        }
      }
    }

    if(!this.SITRepresentation.validationIndicator) {
      this.showError("Warning!", "Validation Indicator is not set!");
    }
    let res = this.SITRepresentation.generateSITString();
    this.outputCodeEditor.setValue(res, 1);

    // Temporary fix for ace editor resize when text is too big
    window.dispatchEvent(new Event('resize'));
  }

  showError(title:string, message: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {title, message};
    this.matDialog.open(ErrorDialogComponent, dialogConfig);
  }

  openHelp() {
    const dialogConfig = new MatDialogConfig();
    this.matDialog.open(HelpDialogComponent, dialogConfig);
  }
}
