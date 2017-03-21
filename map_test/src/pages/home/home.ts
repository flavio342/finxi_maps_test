import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';

import { MenuController } from 'ionic-angular';

import { Geolocation } from 'ionic-native';

declare var google;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public menuCtrl: MenuController, public navCtrl: NavController) {}

  openMenu() {
    this.menuCtrl.open();
  }

  ionViewDidLoad(){
    this.loadMap();
  }
 
  loadMap(){
 
    Geolocation.getCurrentPosition().then((position) => {
 
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
 
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
 
    }, (err) => {
      
      console.log(err);

      let latLng = new google.maps.LatLng(-22.9029383, -43.1766053);
 
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
 
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    });

  }
}