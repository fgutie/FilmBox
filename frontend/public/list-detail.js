const API_BASE = 'http://localhost:3000/api';
const TMDB_API_KEY = 'f5cb4bd58b0a6754b238b1e9c5ac5b88';
let currentListId = null;
let currentList = null;
let searchTimeout = null;

function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function showLoggedUI(user) {
  document.getElementById('username-display').textContent = user.username || user.email || 'Usuari';
  document.getElementById('nav-user').classList.remove('hidden');
}

function redirectToLogin() {
  window.location.href = 'index.html';
}

function redirectToLists() {
  window.location.href = 'lists.html';
}

async function loadListDetail() {
  const user = getCurrentUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  showLoggedUI(user);
  currentListId = getQueryParam('id');
  if (!currentListId) {
    redirectToLists();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/lists/${currentListId}`);
    if (!response.ok) {
      throw new Error('No s’ha pogut carregar la llista');
    }

    currentList = await response.json();
    document.getElementById('list-title').textContent = currentList.name || 'Llista sense nom';
    document.getElementById('list-description').textContent = currentList.description || 'Sense descripció disponible';
    renderMovies(currentList.movies || []);
  } catch (error) {
    console.error('Error carregant la llista:', error);
    redirectToLists();
  }
}

function renderMovies(movies) {
  const container = document.getElementById('movies-container');
  container.innerHTML = '';

  if (!movies || movies.length === 0) {
    container.innerHTML = '<p class="text-white text-center col-span-full">Aquesta llista encara no té pel·lícules. Usa el botó + Afegir pel·lícula per començar.</p>';
    return;
  }

  movies.forEach((movie) => {
    const card = document.createElement('div');
    card.className = 'bg-white/5 border border-white/10 rounded-3xl p-4 shadow-lg shadow-black/20';
    card.innerHTML = `
      <img src="${movie.posterurl || 'https://via.placeholder.com/300x450/374151/ffffff?text=No+Image'}" alt="${movie.title}" class="w-full h-64 object-cover rounded-2xl mb-4">
      <h3 class="text-xl font-bold text-white mb-2">${movie.title}</h3>
      <p class="text-sm text-gray-300 mb-2">Any: ${movie.year || 'Desconegut'}</p>
      <div class="flex justify-between items-center gap-3">
        <button type="button" class="remove-movie-btn bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition">Eliminar</button>
      </div>
    `;

    const removeButton = card.querySelector('.remove-movie-btn');
    removeButton.addEventListener('click', () => removeMovie(movie.id));

    container.appendChild(card);
  });
}

function openAddModal() {
  document.getElementById('modal-add-movie').classList.remove('hidden');
}

function closeAddModal() {
  document.getElementById('modal-add-movie').classList.add('hidden');
  document.getElementById('movies-list').innerHTML = '';
  document.getElementById('search-movies').value = '';
}

async function searchMovies(query) {
  const container = document.getElementById('movies-list');
  if (!query) {
    container.innerHTML = '<p class="text-gray-400 text-center py-4">Escriu alguna cosa per buscar pel·lícules.</p>';
    return;
  }

  container.innerHTML = '<p class="text-gray-400 text-center py-4">Buscant...</p>';

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=1`);
    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-center py-4">No s’han trobat pel·lícules.</p>';
      return;
    }

    container.innerHTML = '';
    results.forEach((movie) => {
      const item = document.createElement('div');
      item.className = 'bg-white/10 border border-white/20 rounded-2xl p-4 mb-3 flex items-start gap-4';
      item.innerHTML = `
        <div class="min-w-[80px] w-[80px] h-[120px] overflow-hidden rounded-2xl bg-gray-900">
          <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/80x120/374151/ffffff?text=No+Image'}" alt="${movie.title}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1">
          <h4 class="text-white font-semibold mb-1">${movie.title}</h4>
          <p class="text-gray-300 text-sm mb-3">${movie.release_date ? movie.release_date.slice(0, 4) : 'Desconegut'}</p>
          <button type="button" class="add-movie-btn bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition">Afegir</button>
        </div>
      `;

      const addButton = item.querySelector('.add-movie-btn');
      addButton.addEventListener('click', () => addMovieToList(movie));
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Error cercant pel·lícules:', error);
    document.getElementById('movies-list').innerHTML = '<p class="text-red-400 text-center py-4">Error en la cerca. Torna-ho a provar.</p>';
  }
}

async function addMovieToList(movie) {
  if (!currentListId) {
    alert('Llista no disponible');
    return;
  }

  const payload = {
    listId: currentListId,
    movie: {
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? movie.release_date.slice(0, 4) : '????',
      avgrating: movie.vote_average || 0,
      posterurl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
      genre: '',
      overview: movie.overview || '',
      release_date: movie.release_date || ''
    }
  };

  try {
    const response = await fetch(`${API_BASE}/lists/add-movie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'No s’ha pogut afegir la pel·lícula');
    }

    currentList = await response.json();
    renderMovies(currentList.movies || []);
    alert('Pel·lícula afegida a la llista!');
    closeAddModal();
  } catch (error) {
    console.error('Error afegint pel·lícula:', error);
    alert('No s’ha pogut afegir la pel·lícula a la llista. Torna-ho a provar.');
  }
}

async function removeMovie(movieId) {
  if (!currentListId) return;

  try {
    const response = await fetch(`${API_BASE}/lists/remove-movie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ listId: currentListId, movieId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'No s’ha pogut eliminar la pel·lícula');
    }

    currentList = await response.json();
    renderMovies(currentList.movies || []);
  } catch (error) {
    console.error('Error eliminant pel·lícula:', error);
    alert('No s’ha pogut eliminar la pel·lícula. Torna-ho a provar.');
  }
}

function setupEvents() {
  document.getElementById('btn-add-movie').addEventListener('click', openAddModal);
  document.getElementById('btn-close-add-modal').addEventListener('click', closeAddModal);
  document.getElementById('search-movies').addEventListener('input', (event) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchMovies(event.target.value.trim()), 500);
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    redirectToLogin();
  });

  const homeLink = document.getElementById('home-link');
  if (homeLink) {
    homeLink.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  setupEvents();
  loadListDetail();
});
