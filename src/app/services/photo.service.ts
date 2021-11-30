import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';

export interface IPhoto {
  filepath: string;
  webviewPath: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos: IPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  constructor() {}

  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  public async addNewToGallery() {
    // Capture a picture
    const capturedPicture = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const savedImageFile = await this.savePicture(capturedPicture);

    this.photos.unshift(savedImageFile);

    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  public async loadSaved() {
    const photoList = await Storage.get({
      key: this.PHOTO_STORAGE,
    });

    this.photos = JSON.parse(photoList.value) || [];

    for (let photo of this.photos) {
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });

      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }

  private async savePicture(cameraPhoto: Photo) {
    const base64Data = await this.readAsBase64(cameraPhoto);

    const filename = new Date().getTime() + '.jpeg';
    const saveFile = await Filesystem.writeFile({
      path: filename,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: filename,
      webviewPath: cameraPhoto.webPath,
    };
  }

  private async readAsBase64(cameraPhoto: Photo) {
    const response = await fetch(cameraPhoto.webPath);
    const blob = await response.blob();

    return (await this.convertBlobToBase64(blob)) as string;
  }
}
