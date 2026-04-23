// Controlador de listas: crea, consulta, modifica y elimina listas
const List = require('../models/List');

// Crea una nueva lista vacía para un usuario
exports.createList = async (req, res) => {
  try {
    // Recoge los datos enviados desde el frontend
    const { userId, name, description } = req.body;

    // Comprueba que exista userId y nombre de lista
    if (!userId || !name) {
      return res.status(400).json({ message: 'Falten dades' });
    }

    // Crea la lista en MongoDB
    const list = await List.create({
      userId,
      name,
      description: description || '',
      movies: [],
    });

    // Devuelve la lista creada
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtiene todas las listas de un usuario
exports.getUserLists = async (req, res) => {
  try {
    // Obtiene el id del usuario desde la URL
    const { userId } = req.params;

    // Busca todas las listas de ese usuario, ordenadas de más nueva a más antigua
    const lists = await List.find({ userId }).sort({ createdAt: -1 });

    // Devuelve el array de listas
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtiene una lista concreta por su ID
exports.getListById = async (req, res) => {
  try {
    // Obtiene el id de la lista desde la URL
    const { listId } = req.params;

    // Busca la lista en MongoDB
    const list = await List.findById(listId);

    // Si no existe, devuelve error
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    // Devuelve la lista encontrada
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Añade una película a una lista
exports.addMovieToList = async (req, res) => {
  try {
    // Recoge el id de la lista y la película enviada
    const { listId, movie } = req.body;

    // Busca la lista correspondiente
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    // Comprueba si la película ya existe en la lista
    const exists = list.movies.some(m => String(m.id) === String(movie.id));
    if (exists) return res.status(400).json({ message: 'Película ya en la lista' });

    // Añade la película al array de movies
    list.movies.push(movie);

    // Guarda los cambios en MongoDB
    await list.save();

    // Devuelve la lista actualizada
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Elimina una película de una lista
exports.removeMovieFromList = async (req, res) => {
  try {
    // Recoge el id de la lista y el id de la película
    const { listId, movieId } = req.body;

    // Busca la lista en MongoDB
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    // Filtra el array y elimina la película seleccionada
    list.movies = list.movies.filter(m => String(m.id) !== String(movieId));

    // Guarda la lista actualizada
    await list.save();

    // Devuelve la lista actualizada
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Elimina una lista completa
exports.deleteList = async (req, res) => {
  try {
    // Obtiene el id de la lista desde la URL
    const { listId } = req.params;

    // Borra la lista de MongoDB
    const list = await List.findByIdAndDelete(listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    // Devuelve mensaje de confirmación
    res.json({ message: 'Lista eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};