/*********************************************************************************
WEB322 – Assignment 02

I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
No part of this assignment has been copied manually or electronically from any other source 
(including 3rd party web sites) or distributed to other students.

Name: Your Name
Student ID: Aaron Joseph
Date: 2025-02-06
github Web App URL: https://ajoseph88.github.io/web322-app/
GitHub Repository URL: https://github.com/ajoseph88/web322-app.git
*********************************************************************************/

const express = require("express");
const path = require("path");
const storeService = require("./store-service");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to serve static files (CSS, images, etc.)
app.use(express.static("public"));

// Redirect root to /about
app.get("/", (req, res) => {
    res.redirect("/about");
});

// Serve about.html
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views/about.html"));
});

// Get all published items (shop page)
app.get("/shop", (req, res) => {
    storeService.getPublishedItems()
        .then(items => res.json(items))
        .catch(err => res.status(404).json({ message: err }));
});

// Get all items
app.get("/items", (req, res) => {
    storeService.getAllItems()
        .then(items => res.json(items))
        .catch(err => res.status(404).json({ message: err }));
});

// Get all categories
app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(404).json({ message: err }));
});

// Handle 404 - Page Not Found
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize store service and start the server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.log("Failed to initialize store service:", err);
    });
