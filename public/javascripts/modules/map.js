import axios from 'axios';

const defaultPosition = {
  lat: 43.2,
  lng: -79.8,
};

const mapOptions = {
  center: defaultPosition,
  zoom: 2,
};

function handleMarkerClick(map, infoWindow) {
  const html = `
    <div class="popup">
      <a href="/store/${this.place.slug}">
        <img src="/uploads/${this.place.photo || 'store.png'}" alt="${
    this.place.name
  }" />
      <p>${this.place.name} - ${this.place.location.address}</p>
      </a>
    </div>
  `;

  infoWindow.setContent(html);
  infoWindow.open(map, this);
}

function handleAutocompleteChange(map) {
  const place = this.getPlace();
  const position = {
    lat: place.geometry.location.lat(),
    lng: place.geometry.location.lng(),
  };

  loadPlaces(map, position);
}

function loadPlaces(map, position) {
  axios
    .get(`/api/stores/near?lat=${position.lat}&lng=${position.lng}`)
    .then((response) => {
      const places = response.data;

      if (!places.length) {
        alert('No places found!');
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      places.map((place) => {
        const [placeLng, placeLat] = place.location.coordinates;
        const position = {
          lat: placeLat,
          lng: placeLng,
        };
        const marker = new google.maps.Marker({
          map,
          position,
        });

        marker.place = place;
        marker.addListener(
          'click',
          handleMarkerClick.bind(marker, map, infoWindow)
        );
        bounds.extend(position);

        return marker;
      });

      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
    })
    .catch((err) => console.log(err));
}

function Map(mapDiv) {
  if (!mapDiv) return;

  const map = new google.maps.Map(mapDiv, mapOptions);
  const searchInput = document.querySelector('input[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(searchInput);

  autocomplete.addListener(
    'place_changed',
    handleAutocompleteChange.bind(autocomplete, map)
  );

  loadPlaces(map, defaultPosition);
}

export default Map;
