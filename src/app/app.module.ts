import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule, MatFormFieldModule, MatInputModule, MatButtonModule,
         MatIconModule, MatTooltipModule, MatDialogModule } from '@angular/material';

import { NgxElectronModule } from 'ngx-electron';
import { NgxFsModule } from 'ngx-fs';

import { AppComponent } from './app.component';
import { ErrorDialogComponent } from './errors/error-dialog/error-dialog.component';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    ErrorDialogComponent,
    HelpDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgxElectronModule,
    NgxFsModule,
    MatToolbarModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ErrorDialogComponent, HelpDialogComponent]
})
export class AppModule { }
