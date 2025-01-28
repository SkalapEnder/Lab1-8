const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://skalap2endra:kGOM7z5V54vBFdp1@cluster0.vannl.mongodb.net/books?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log("Index: Connected to MongoDB Atlas"))
    .catch(err => console.log("Error during connect to MongoDB: ", err));

let books = [];

// Define Mongoose Schema and Model for Books
// ################################
const bookSchema = new mongoose.Schema({
    book_id: {type: Number, required: true, unique: true},
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    year: { type: Number, required: true }
});

const Book = mongoose.model('book', bookSchema);

// Enter point
// ################################
app.get('/' , (req, res) => {res.render('index')});

// Routes
// ################################
app.get('/books', (req, res) => res.send(books));

app.get('/books/:id', (req, res) => {
    const id = req.params.id;
    const book = books.find(b => b.book_id === Number(id));
    if (book === undefined || book === null) {
        return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
});

app.post('/books', async (req, res) => {
    const { title, author, genre, year } = req.body;

    if (!title || !author || !genre || !year) {
        return res.status(400).json({ message: 'All fields (title, author, genre, year) are required' });
    }

    let newID = 0;

    if (books.length !== 0) {
        newID = books[books.length - 1]["book_id"] + 1;
    }

    const newBook = { book_id: newID, title: title, author: author, genre: genre, year: year };
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
    const id = req.params.id;
    const bookIndex = books.findIndex(b => b.book_id === id);

    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const deletedBook = books.splice(bookIndex, 1);
    res.json(deletedBook[0]);
});

// ################################
// MongoDB Atlas part
app.get('/books-mng', async (req, res) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving books', error: err });
    }
});

app.get('/books-mng/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findOne({book_id: id});
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving book', error: err });
    }
});

app.post('/books-mng', async (req, res) => {
    const { title, author, genre, year } = req.body;

    if (title === undefined ||
        author === undefined ||
        genre === undefined ||
        year === undefined) {
        return res.status(400).json({ message: 'All fields (title, author, genre, year) are required '});
    }

    try {
        const newID = await getNextFreeBookId();
        const newBook = new Book({
            book_id: newID,
            title: title,
            author: author,
            genre: genre,
            year: year
        });
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(500).json({ message: 'Error creating book', error: err });
    }
});

app.put('/books-mng/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, genre, year } = req.body;

    if (!title || !author || !genre || !year) {
        return res.status(400).json({ message: 'All fields (title, author, genre, year) are required' });
    }

    try {
        const updatedBook = await Book.findOneAndUpdate(
            { book_id: id },
            { title: title, author: author, genre: genre, year: year },
            { new: true }
        );
        if (updatedBook=== null) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(updatedBook);
    } catch (err) {
        res.status(500).json({ message: 'Error updating book', error: err });
    }
});

app.delete('/books-mng/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedBook = await Book.findOneAndDelete({book_id: Number(id)});
        if (deletedBook === null) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(deletedBook);
    } catch (err) {
        res.status(500).json({ message: 'Error deleting book', error: err });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


async function getNextFreeBookId() {
    try {
        const lastBook = await Book.find({}).sort({ book_id: -1 });
        console.log(lastBook);
        if (lastBook === null || lastBook.length === 0) {
            return 0;
        }
        return lastBook[0]['book_id'] + 1;
    } catch (err) {
        console.error('Error retrieving next free user_id:', err.message);
        throw new Error('Failed to retrieve next free user ID');
    }
}

async function getFreeBookId() {

}
