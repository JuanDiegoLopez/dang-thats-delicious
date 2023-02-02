import axios from 'axios';
import DOMPurify from 'dompurify';

const keyCodes = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  enter: 'Enter',
};

const generateOptions = (stores) => {
  return stores
    .map((store) => {
      return `<a href="/store/${store.slug}" class="search__result">
      <strong>${store.name}</strong>
    </a>`;
    })
    .join('');
};

const typeAhead = (searchElement) => {
  if (!searchElement) return;

  const searchInput = searchElement.querySelector('input[name="search"]');
  const searchResults = searchElement.querySelector('.search__results');

  searchInput.addEventListener('input', (event) => {
    const value = event.target.value;

    if (!value) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${value}`)
      .then((response) => {
        if (!response.data.length) {
          searchResults.innerHTML = DOMPurify.sanitize(
            '<a class="search__result">No stores found.</a>'
          );

          return;
        }

        searchResults.innerHTML = DOMPurify.sanitize(
          generateOptions(response.data)
        );
      })
      .catch((err) => console.log(err));
  });

  searchInput.addEventListener('keydown', (event) => {
    if (!Object.values(keyCodes).includes(event.key)) return;

    const activeClass = 'search__result--active';
    const options = searchElement.querySelectorAll('.search__result');
    const current = searchElement.querySelector(`.${activeClass}`);
    let next;

    switch (event.key) {
      case keyCodes.up:
        const prevEl = current && current.previousElementSibling;
        next = prevEl ? prevEl : options[options.length - 1];
        break;

      case keyCodes.down:
        const nextEl = current && current.nextElementSibling;
        next = nextEl ? nextEl : options[0];
        break;

      case keyCodes.enter:
        window.location = current.href;
        return;
    }

    if (current) {
      current.classList.remove(activeClass);
    }

    next.classList.add(activeClass);
  });
};

export default typeAhead;
