import Vue from 'nativescript-vue'
import App from './components/App'

import store from './store';

import RadListView from 'nativescript-ui-listview/vue';

import * as application from "tns-core-modules/application";
var imageCache = require("nativescript-web-image-cache");

if(application.android){
  application.on("launch", function () {
    imageCache.initialize();
  });
}

import {TNSFontIcon, fonticon} from 'nativescript-fonticon';

TNSFontIcon.debug = true;
TNSFontIcon.paths = {
  'fa': 'assets/font-awesome.css'
};
TNSFontIcon.loadCss();

Vue.filter('fonticon', fonticon);

import VueDevtools from 'nativescript-vue-devtools'

if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.use(RadListView);

Vue.registerElement('Carousel', () => require('nativescript-carousel').Carousel) 
Vue.registerElement('CarouselItem', () => require('nativescript-carousel').CarouselItem)
Vue.registerElement('RadSideDrawer', () => require('nativescript-ui-sidedrawer').RadSideDrawer)
Vue.registerElement('WebImage', () => require('nativescript-web-image-cache').WebImage)

new Vue({
  store,
  render: h => h('frame', [h(App)])
}).$start()
