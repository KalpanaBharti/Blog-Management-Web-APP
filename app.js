const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Blog = require('./models/blog');
require('dotenv').config(); // Ensure dotenv is used if you're loading env variables from a .env file

// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Database connected');
    })
    .catch((err) => {
        console.error('Database connection error:', err.message);
    });

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.urlencoded({ extended: true }));

const port = 3000;

// Routes
app.get('/', (req, res) => {
    res.redirect('/add-blog');
});

// Show all blogs
app.get('/show-blogs', async (req, res) => {
    try {
        const allBlogs = await Blog.find({});
        console.log(allBlogs);
        res.render('Show_blogs', { allBlogs });
    } catch (err) {
        console.error('Error fetching blogs:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Render add blog form
app.get('/add-blog', (req, res) => {
    res.render('add_item');
});

// Handle adding new blog
app.post('/add-blog', async (req, res) => {
    const { fname, lname, email, title, image1, image2, image3, image4, content } = req.body;

    if (!fname || !lname || !email || !title || !content) {
        console.log('Missing required fields');
        return res.status(400).send('Missing required fields');
    }

    try {
        const isDataStored = await Blog.create({
            name: `${fname} ${lname}`,
            email: email,
            photo: [image1, image2, image3, image4],
            text: content,
            title: title,
        });

        if (!isDataStored) {
            console.log('Error storing data');
        }

        console.log('Data stored successfully');
        res.redirect('/show-blogs');
    } catch (err) {
        console.error('Error saving blog:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Read a single blog by ID
app.get('/read-blog/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const item = await Blog.findById(id);
        if (!item) {
            return res.status(404).send('Blog not found');
        }
        console.log(item);
        res.render('read_blogs', { item });
    } catch (err) {
        console.error('Error fetching blog:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete a blog by ID
app.post('/delete-blog/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleteItem = await Blog.findByIdAndDelete(id);
        if (!deleteItem) {
            console.log('Item not deleted');
            return res.status(404).send('Blog not found');
        }

        console.log('Item deleted');
        res.redirect('/show-blogs');
    } catch (err) {
        console.error('Error deleting blog:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
