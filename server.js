/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aaron Joseph
*  Student ID: 151757226
*  Date: March 05, 2025
*  Cyclic Web App URL: 
*  GitHub Repository URL: https://github.com/ajoseph88/web322-app.git
*
*********************************************************************************/

const express = require("express");
const path = require("path");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const app = express();
const PORT = process.env.PORT || 8080;


app.use(express.static("public"));

cloudinary.config({
    cloud_name: "TITLE", 
    api_key: "777141267615443",
    api_secret: "YuqEw9ANgcUnOXX8dgO78pKAZRQE",
    secure: true
});


const upload = multer();


app.get("/", (req, res) => {
    res.redirect("/about");
});


app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "about.html"));
});


app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "addItem.html"));
});


app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((err) => {
            console.error("Error uploading image:", err);
            processItem(""); 
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;

        const itemData = {
            title: req.body.title,
            price: req.body.price,
            body: req.body.body,
            category: req.body.category,
            published: req.body.published ? true : false,
            featureImage: req.body.featureImage
        };

        storeService
            .addItem(itemData)
            .then(() => res.redirect("/items"))
            .catch((err) => res.status(500).send(`Error adding item: ${err}`));
    }
});


app.get("/shop", (req, res) => {
    storeService.getPublishedItems()
        .then(items => res.json(items))
        .catch(err => res.status(404).json({ message: err }));
});

app.get("/items", (req, res) => {
    if (req.query.category) {
        storeService
            .getItemsByCategory(req.query.category)
            .then(items => res.json(items))
            .catch(err => res.status(404).json({ message: err }));
    } else if (req.query.minDate) {
        storeService
            .getItemsByMinDate(req.query.minDate)
            .then(items => res.json(items))
            .catch(err => res.status(404).json({ message: err }));
    } else {
        storeService
            .getAllItems()
            .then(items => res.json(items))
            .catch(err => res.status(404).json({ message: err }));
    }
});

// Get item by ID
app.get("/item/:id", (req, res) => {
    storeService
        .getItemById(req.params.id)
        .then(item => res.json(item))
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


storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize store service:", err);
    });