import '../sass/style.scss';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import Map from './modules/map';
import ajaxFavorite from './modules/heart';

const addressInput = document.getElementById('address');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');
const searchElement = document.querySelector('.search');
const mapElement = document.getElementById('map');
const heartForms = document.querySelectorAll('form.heart');

heartForms.forEach(form => {
  form.addEventListener('submit', ajaxFavorite);
});

typeAhead(searchElement);

function init() {
  Map(mapElement);
  autocomplete(addressInput, latInput, lngInput);
}


window.init = init;
