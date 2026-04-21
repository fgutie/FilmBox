"hace la lógica de crear listas, leer las listas de un usuario, añadir películas y borrarlas."
const List = require('../models/List');

exports.createList = async (req, res) => {
  try {
    const { userId, name, description } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ message: 'Falten dades' });
    }

    const list = await List.create({
      userId,
      name,
      description: description || '',
      movies: [],
    });

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserLists = async (req, res) => {
  try {
    const { userId } = req.params;
    const lists = await List.find({ userId }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getListById = async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await List.findById(listId);

    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMovieToList = async (req, res) => {
  try {
    const { listId, movie } = req.body;

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    const exists = list.movies.some(m => String(m.id) === String(movie.id));
    if (exists) return res.status(400).json({ message: 'Película ya en la lista' });

    list.movies.push(movie);
    await list.save();

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMovieFromList = async (req, res) => {
  try {
    const { listId, movieId } = req.body;

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    list.movies = list.movies.filter(m => String(m.id) !== String(movieId));
    await list.save();

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const { listId } = req.params;

    const list = await List.findByIdAndDelete(listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    res.json({ message: 'Lista eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};