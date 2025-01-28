const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(express.json());

let books = [];

// Routes
app.get('/books', (req, res) => res.json(books));

app.get('/books/:id', (req, res) => {
    const { id } = req.params;
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
});

app.post('/books', (req, res) => {
    const { title, author, genre, year } = req.body;

    if (!title || !author || !genre || !year) {
        return res.status(400).json({ message: 'All fields (title, author, genre, year) are required' });
    }

    const newBook = { id: uuidv4(), title, author, genre, year };
    books.push(newBook);
    res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, genre, year } = req.body;
    const bookIndex = books.findIndex(b => b.id === id);

    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (!title || !author || !genre || !year) {
        return res.status(400).json({ message: 'All fields (title, author, genre, year) are required' });
    }

    books[bookIndex] = { id, title, author, genre, year };
    res.json(books[bookIndex]);
});

app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const bookIndex = books.findIndex(b => b.id === id);

    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const deletedBook = books.splice(bookIndex, 1);
    res.json(deletedBook[0]);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
