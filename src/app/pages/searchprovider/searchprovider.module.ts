import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchproviderPageRoutingModule } from './searchprovider-routing.module';

import { SearchproviderPage } from './searchprovider.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchproviderPageRoutingModule
  ],
  declarations: [SearchproviderPage]
})
export class SearchproviderPageModule {}