const API_BASE = 'http://localhost:3000/api';

function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function showLoggedUI(user) {
  document.getElementById('username-display').textContent = user.username || user.email || 'Usuari';
  document.getElementById('nav-user').classList.remove('hidden');
}

function redirectToLogin() {
  window.location.href = 'index.html';
}

async function loadUserLists() {
  const user = getCurrentUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  const listsContainer = document.getElementById('lists-container');
  listsContainer.innerHTML = '<p class="text-white text-center col-span-full">Carregant les teves llistes...</p>';

  try {
    const response = await fetch(`${API_BASE}/lists/user/${user._id}`);
    if (!response.ok) {
      throw new Error('No s’han pogut carregar les llistes');
    }

    const lists = await response.json();

    if (!Array.isArray(lists) || lists.length === 0) {
      listsContainer.innerHTML = '<p class="text-white text-center col-span-full">No tens cap llista encara. Crea una llista per començar!</p>';
      return;
    }

    listsContainer.innerHTML = '';
    lists.forEach((list) => {
      const card = document.createElement('div');
      card.className = 'bg-white/5 border border-white/10 rounded-3xl p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1';
      card.innerHTML = `
        <h2 class="text-2xl font-bold text-white mb-2">${list.name}</h2>
        <p class="text-sm text-gray-300 mb-4">${list.description || 'Sense descripció'}</p>
        <p class="text-xs text-gray-400 mb-6">Pel·lícules: ${Array.isArray(list.movies) ? list.movies.length : 0}</p>
        <div class="flex items-center gap-3">
          <button type="button" class="btn-view-list bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition">Veure llista</button>
        </div>
      `;

      const viewBtn = card.querySelector('.btn-view-list');
      viewBtn.addEventListener('click', () => {
        window.location.href = `list-detail.html?id=${list._id}`;
      });

      listsContainer.appendChild(card);
    });
  } catch (error) {
    listsContainer.innerHTML = `<p class="text-red-400 text-center col-span-full">Error carregant les llistes. Torna-ho a provar.</p>`;
    console.error('Error carregant llistes:', error);
  }
}

function openCreateModal() {
  document.getElementById('modal-create-list').classList.remove('hidden');
}

function closeCreateModal() {
  document.getElementById('modal-create-list').classList.add('hidden');
}

async function handleCreateList(event) {
  event.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  const nameInput = document.getElementById('list-name');
  const descriptionInput = document.getElementById('list-description');
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!name) {
    alert('Introdueix un nom per la llista');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user._id,
        name,
        description
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error creant la llista');
    }

    nameInput.value = '';
    descriptionInput.value = '';
    closeCreateModal();
    await loadUserLists();
  } catch (error) {
    alert('No s’ha pogut crear la llista. Torna-ho a provar.');
    console.error('Error creant llista:', error);
  }
}

function setupEvents() {
  document.getElementById('btn-create-list').addEventListener('click', openCreateModal);
  document.getElementById('btn-close-modal').addEventListener('click', closeCreateModal);
  document.getElementById('form-create-list').addEventListener('submit', handleCreateList);
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

  showLoggedUI(user);
  setupEvents();
  loadUserLists();
});
