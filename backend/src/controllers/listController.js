const List = require('../models/List');

exports.createList = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.body.userId; // Desde el body

    const list = await List.create({
      userId,
      name,
      description,
      movies: []
    });

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserLists = async (req, res) => {
  try {
    const userId = req.params.userId;

    const lists = await List.findAll({ where: { userId } });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getListById = async (req, res) => {
  try {
    const { listId } = req.params;

    const list = await List.findByPk(listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMovieToList = async (req, res) => {
  try {
    const { listId, movie } = req.body;

    const list = await List.findByPk(listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    // Verificar si la película ya está en la lista
    const exists = list.movies.some(m => m.id === movie.id);
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

    const list = await List.findByPk(listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    list.movies = list.movies.filter(m => m.id !== parseInt(movieId));
    await list.save();

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const { listId } = req.params;

    await List.destroy({ where: { id: listId } });
    res.json({ message: 'Lista eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};