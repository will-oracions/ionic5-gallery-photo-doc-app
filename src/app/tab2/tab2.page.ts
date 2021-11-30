import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  constructor(public photoService: PhotoService, private platform: Platform) {}

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }
}
