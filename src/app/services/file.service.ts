import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private ipc: IpcRenderer;
  private fs;
  private dialog;

  constructor() {
    if((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').IpcRenderer;
        this.fs = window['require']('fs');
        this.dialog = window['require']('electron').dialog;
      } catch (error) {
        throw error;
      }
    } else {
      console.warn('Could not load electron ipc');
    }
  }

  async saveFile(options) {
    console.log(this.dialog);
    console.log(this.fs);
  }

}
