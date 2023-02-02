function autocomplete(addressInput, latInput, lngInput) {
  if (!addressInput) return;

  const dropdown = new google.maps.places.Autocomplete(addressInput);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });

  addressInput.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  });
}

export default autocomplete;