import express from 'express';
import dotenv from 'dotenv';
import path from 'path'
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const urlencoderParser = express.urlencoded({ extended:false, limit:"1mb", parameterLimit: 5000 });
const port = process.env.PORT || 5000;

app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.use(express.json());

// Setup access to Supabase for retrieving and updating data.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function selectBookById(id) {
    return supabase
        .from('books')
        .select('id,title,author,publisher,year_published,number_of_pages,description,read')
        .eq('id', id)
        .single();
}

async function updateBookById(id, title, author, number_of_pages, publisher, year_published, description, read) {
    return supabase
        .from('books')
        .update({ title, author, number_of_pages, publisher, year_published, description, read})
        .eq('id', id)
        .select();
}

async function selectBooksByRead(read) {
    return supabase
        .from('books')
        .select('id,title,author,publisher,year_published,number_of_pages,description,read')
        .eq('read', read)
        .order('id');
}

async function selectBooksWithOrder(column) {
    return supabase
        .from('books')
        .select('id,title,author,publisher,year_published,number_of_pages,description,read')
        .order(column);
}

async function formatData(data) {
    // Render "nulls" as empty strings
    for (let i = 0; i < data.length; i++) {
        if (data[i].description == null) {
            (data[i].description = "")
        }
        if (data[i].year_published == null) {
            (data[i].year_published = "")
        }
        if (data[i].publisher == null) {
            (data[i].publisher = "")
        }
    }
}

async function showBooksByRead(req, res, read) {
    var getBooksQuery = selectBooksByRead(read);

    const { data, error} = await getBooksQuery;

    if (data && data.length == 0) {
        return res.status(404).json({error: `No records found.`});
    }

    if (error) {
        return res.status(500).json({error: error.message});
    }
    
    // Clean up the data (ex: suppressing the display of "nulls")
    formatData(data);

    res.render('bookShowAll', {books: JSON.stringify(data)});
    
}

function convertToNumber(num) {
    return isNaN(num) ? null : parseInt(num, 10);
}

function validateFields(req, res) {
    if (req.body.id && isNaN(req.body.id)) {
        res.status(400).json({ error: 'Non-numeric id was entered.'});
        return false;
    }
    if (!req.body.title) {
        res.status(400).json({ error: 'Required field Title is missing.'});
        return false;
    }
    if (!req.body.author) {
        res.status(400).json({ error: 'Required field Author is missing.'});
        return false;
    }
    if (req.body.number_of_pages && !convertToNumber(req.body.number_of_pages)) {
        res.status(400).json({ error: 'Required field Number Of Pages is invalid.'});
        return false;
    }
    if (!req.body.number_of_pages) {
        res.status(400).json({ error: 'Required field Number Of Pages is missing.'});
        return false;
    }
    if (req.body.year_published && !convertToNumber(req.body.year_published)) {
        res.status(400).json({ error: 'Non-numeric value entered for Year Published.'});
        return false;
    }
    return true;
}

app.get('/', function(req, res) {
    res.render('bookRequest');
});

app.get('/books/add/', function(req, res) {
    res.render('bookRequestAdd');
});

app.get('/books/update/', async(req, res) => {
    const id = req.query.updateId;
    if (!id) {
        return res.status(400).json({ error: 'Required field id is missing.'}); 
    }
    if (id && isNaN(id)) {
        return res.status(400).json({ error: 'Non-numeric id was entered.'});
    }

    var getBooksQuery = selectBookById(id);

    const { data, error} = await getBooksQuery;
    if (error) {
        if (id && "The result contains 0 rows" === error.details) {
            return res.status(404).json({error: `ID ${id} not found.`});
        } else {
            return res.status(500).json({error: error.message});
        }
    }
   
    res.render('bookRequestUpdate', {book: data});
});

app.get('/books', async(req, res) => {
    const id = req.query.id;
    var getBooksQuery;

    // If id not provided retrieve all books else retrieve the record matching the id.
    if (!id) {
        getBooksQuery = selectBooksWithOrder('id');
    } else {
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Non-numeric id was entered.'});
        }
        getBooksQuery = selectBookById(id);
    }

    const { data, error} = await getBooksQuery;

    if (data && data.length == 0) {
        return res.status(404).json({error: `No records found.`});
    }

    if (error) {
        if (id && "The result contains 0 rows" === error.details) {
            return res.status(404).json({error: `ID ${id} not found.`});
        } else {
            return res.status(500).json({error: error.message});
        }
    }

    // Clean up the data (ex: suppressing the display of "nulls")
    formatData(data);

    if (id) {
        res.render('bookShowOne', {book: data});
    } else {
        res.render('bookShowAll', {books: JSON.stringify(data)});
    }
});

app.get('/books/sortTitle', async(req, res) => {
    const id = req.query.id;
    var getBooksQuery = selectBooksWithOrder('title');

    const { data, error} = await getBooksQuery;
    if (error) {
        if ("The result contains 0 rows" === error.details) {
            return res.status(404).json({error: `No records found.`});
        } else {
            return res.status(500).json({error: error.message});
        }
    }
    
    // Clean up the data (ex: suppressing the display of "nulls")
    formatData(data);

    res.render('bookShowAll', {books: JSON.stringify(data)});
});

app.get('/books/sortAuthor', async(req, res) => {
    const id = req.query.id;
    var getBooksQuery = selectBooksWithOrder('author');

    const { data, error} = await getBooksQuery;
    if (error) {
        if ("The result contains 0 rows" === error.details) {
            return res.status(404).json({error: `No records found.`});
        } else {
            return res.status(500).json({error: error.message});
        }
    }
    
    // Clean up the data (ex: suppressing the display of "nulls")
    formatData(data);

    res.render('bookShowAll', {books: JSON.stringify(data)});
});

app.get('/books/filterRead/', async(req, res) => {
    showBooksByRead(req, res, 'true');
});

app.get('/books/filterUnread/', async(req, res) => {
    showBooksByRead(req, res, 'false');
});

app.post('/books/update', urlencoderParser, async(req, res, next) => {
    let status = validateFields(req, res);
    
    if (false === status) {
        return res.send();
    }
    const id = req.body.id;
    const title = req.body.title;
    const author = req.body.author;
    const number_of_pages = convertToNumber(req.body.number_of_pages);
    const read = ("on" === req.body.read);
    const publisher = req.body.publisher;
    const year_published = convertToNumber(req.body.year_published);
    const description = req.body.description;

    var upsertBooksQuery, addRequest;
    if (id) {
            addRequest = false;
            // Check if row exists for id.  If found, do an update.
            let getBooksByIdQuery = selectBookById(id);

            const { data, error } = await getBooksByIdQuery;
            if (error) {
                return res.status(404).json({error: `ID ${id} not found.`});
            } else {
                upsertBooksQuery = 
                    updateBookById(id, title, author, number_of_pages, publisher, year_published, description, read);
            } 
    } else {
            // if no id, do an insert.
            addRequest = true;
            upsertBooksQuery = supabase
                .from('books')
                .insert({ title, author, number_of_pages, publisher, year_published, description, read})
                .select();
    }

    const { data, error } = await upsertBooksQuery;

    if (error) {
        return res.status(500).json({error: error.message});
    }

    res.render('bookAdded', {book: data[0], addRequest: addRequest});
});

app.post('/books/delete', urlencoderParser, async(req, res) => {
    const id = req.body.deleteId;
    if (!id) {
        return res.status(400).json({ error: 'Required field id is missing.'}); 
    }
    if (id && isNaN(id)) {
        return res.status(400).json({ error: 'Non-numeric id was entered.'});
    }

    // check if row exists for id
    let getBooksByIdDeleteQuery = selectBookById(id);

    var { dataFromSelect, error } = await getBooksByIdDeleteQuery;
    if (error) {
        return res.status(404).json({error: `ID ${id} not found.`});
    }

    var { dataFromDelete, error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

    if (error) {
        return res.status(500).json({error: error.message});
    }

    res.render('bookDeleted', {id: id});
});

app.put('/books/:id', async(req, res) => {
    const id = req.params;
    const title = req.body.title;
    const author = req.body.author;
    const number_of_pages = req.body.number_of_pages;
    const read = req.body.read;
    const publisher = req.body.publisher;
    const year_published = req.body.year_published;
    const description = req.body.description;

    var updateBookByIdQuery = 
            updateBookById(id, title, author, number_of_pages, publisher, year_published, description, read);
    const { data, error } = await updateBookByIdQuery;

    if (error) {
        return res.status(500).json({error: error.message});
    }

    return res.status(200).json(data[0]);
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});