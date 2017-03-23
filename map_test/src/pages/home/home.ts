import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';

import { MenuController } from 'ionic-angular';

import { Geolocation } from 'ionic-native';

import {ConnectivityService} from '../../providers/connectivity-service'

import { LoadingController } from 'ionic-angular';

declare var google;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;

  map: any;
  mapInitialised: boolean = false;
  apiKey: any = "AIzaSyCpG4B_z3mwmttoVZyQv7mgOm0Vm7h0pgo";

  latLng = {lat: -22.902938, lng: -43.176605};

  geocoder;

  public currentLocation;

  loader: any = this.loadingCtrl.create({
    content: "Connecting..."
  });

  constructor(public menuCtrl: MenuController, public navCtrl: NavController, public connectivityService: ConnectivityService, public loadingCtrl: LoadingController) {
  }

  ngAfterViewInit(){
    this.loadGoogleMaps();
  }

  openMenu() {
    this.menuCtrl.open();
  }

  addMarker(){

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<h4>Information!</h4>";
    this.addInfoWindow(marker, content);

  }

  addInfoWindow(marker, content){

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }

  loadGoogleMaps(){

    this.addConnectivityListeners();

    if(typeof google == "undefined" || typeof google.maps == "undefined"){

      console.log("Google maps JavaScript needs to be loaded.");
      this.disableMap();

      if(this.connectivityService.isOnline()){
        console.log("online, loading map");

        //Load the SDK
        window['mapInit'] = () => {
          this.initMap();
          this.enableMap();
        }

        let script = document.createElement("script");
        script.id = "googleMaps";

        if(this.apiKey){
          script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&libraries=places&callback=mapInit';
        } else {
          script.src = 'http://maps.google.com/maps/api/js?libraries=places&callback=mapInit';
        }

        document.body.appendChild(script);

      }
    }
    else {

      if(this.connectivityService.isOnline()){
        console.log("showing map");
        this.initMap();
        this.enableMap();
      }
      else {
        console.log("disabling map");
        this.disableMap();
      }

    }

  }

  initMap(){

    this.mapInitialised = true;

    Geolocation.getCurrentPosition().then((position) => {
      this.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    });

    let mapOptions = {
      center: this.latLng,
      zoom: 17,
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
      zoomControl: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.geocoder = new google.maps.Geocoder;

    this.goToCurrentLocation();

    var card = document.getElementById('pac-card');

    var input = document.getElementById('pac-input').getElementsByTagName('input')[0];

    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(card);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', () => {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport);
      } else {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(17);  // Why 17? Because it looks good.
      }
    });
  }

  goToCurrentLocation(){

    Geolocation.getCurrentPosition().then((position) => {
      var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      this.map.setCenter(initialLocation);
      this.map.setZoom(17);
      this.setCurrentLocation();
    });

  }

  setCurrentLocation() {
    this.geocoder.geocode({'location': this.map.getCenter()}, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          this.currentLocation = results[1].formatted_address;
          console.log(this.currentLocation);
        } else {
          console.log('No results found');
        }
      } else {
        console.log('Geocoder failed due to: ' + status);
      }
    });
  }

  disableMap(){
    console.log("disable map");
    this.loader = this.loadingCtrl.create({
      content: "Connecting..."
    });
    this.loader.present();
  }

  enableMap(){
    console.log("enable map");
    this.loader.dismiss();
  }

  addConnectivityListeners(){

    let onOnline = () => {

      setTimeout(() => {
        if(typeof google == "undefined" || typeof google.maps == "undefined"){

          this.loadGoogleMaps();

        } else {

          if(!this.mapInitialised){
            this.initMap();
          }

          this.enableMap();
        }
      }, 2000);

    };

    let onOffline = () => {
      this.disableMap();
    };

    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);

  }
}
