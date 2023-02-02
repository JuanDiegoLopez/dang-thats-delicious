import axios from 'axios';

function ajaxFavorite(event) {
  event.preventDefault();

  axios
    .post(this.action)
    .then((response) => {
      const countEl = document.querySelector('.heart-count');
      const isFavorite = this.heart.classList.toggle('heart__button--hearted');

      countEl.textContent = response.data.favorites.length;

      if (isFavorite) {
        this.heart.classList.add('heart__button--float');

        setTimeout(() => {
          this.heart.classList.remove('heart__button--float');
        }, 2500);
      }
    })
    .catch(console.error);
}

export default ajaxFavorite;
