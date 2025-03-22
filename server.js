/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aaron Joseph
*  Student ID: 151757226
*  Date: March 19, 2025
*  Cyclic Web App URL: https://ajoseph88.github.io/web322-app/
*  GitHub Repository URL: https://github.com/ajoseph88/web322-app.git
*
*********************************************************************************/

const express = require("express");
const path = require("path");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");

const app = express();
const PORT = process.env.PORT || 8080;

// Configure Handlebars
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          '<li' +
          (url == app.locals.activeRoute ? ' class="active"' : '') +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          '</a></li>'
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) return options.inverse(this);
        else return options.fn(this);
      },
    },
  })
);
app.set("view engine", ".hbs");

// Middleware for static files
app.use(express.static("public"));

// Middleware for active route tracking
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: "TITLE",
  api_key: "777141267615443",
  api_secret: "YuqEw9ANgcUnOXX8dgO78pKAZRQE",
  secure: true,
});

const upload = multer();

// Routes
app.get("/", (req, res) => {
  res.redirect("/shop");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/items/add", (req, res) => {
  res.render("addItem");
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

    upload(req)
      .then((uploaded) => {
        processItem(uploaded.url);
      })
      .catch((err) => {
        console.error("Error uploading image:", err);
        processItem("");
      });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;

    // Add the "postDate" property to the itemData object
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); 
    const day = String(currentDate.getDate()).padStart(2, "0"); 
    const postDate = `${year}-${month}-${day}`;

    const itemData = {
      title: req.body.title,
      price: req.body.price,
      body: req.body.body,
      category: req.body.category,
      published: req.body.published ? true : false,
      featureImage: req.body.featureImage,
      postDate: postDate, // Add the postDate property
    };

    storeService
      .addItem(itemData)
      .then(() => res.redirect("/items"))
      .catch((err) => res.status(500).send(`Error adding item: ${err}`));
  }
});

// Updated /items route to render items.hbs
app.get("/items", (req, res) => {
  if (req.query.category) {
    storeService
      .getItemsByCategory(req.query.category)
      .then((data) => res.render("items", { items: data }))
      .catch((err) => res.render("items", { message: "no results" }));
  } else if (req.query.minDate) {
    storeService
      .getItemsByMinDate(req.query.minDate)
      .then((data) => res.render("items", { items: data }))
      .catch((err) => res.render("items", { message: "no results" }));
  } else {
    storeService
      .getAllItems()
      .then((data) => res.render("items", { items: data }))
      .catch((err) => res.render("items", { message: "no results" }));
  }
});

app.get("/item/:id", (req, res) => {
  storeService
    .getItemById(req.params.id)
    .then((item) => res.json(item))
    .catch((err) => res.status(404).json({ message: err }));
});

// Updated /categories route to render categories.hbs
app.get("/categories", (req, res) => {
  storeService
    .getCategories()
    .then((data) => res.render("categories", { categories: data }))
    .catch((err) => res.render("categories", { message: "no results" }));
});

// Shop Route
app.get("/shop", (req, res) => {
  let viewingCategory = req.query.category || 0;

  let itemPromise = viewingCategory > 0 
    ? storeService.getPublishedItemsByCategory(viewingCategory) 
    : storeService.getPublishedItems();

  let categoryPromise = storeService.getCategories();

  Promise.all([itemPromise, categoryPromise])
    .then(([items, categories]) => {
      let selectedItem = items.length > 0 ? items[0] : null;

      res.render("shop", {
        title: "Shop",
        data: {
          post: selectedItem,
          posts: items,
          categories: categories,
          viewingCategory: viewingCategory
        }
      });
    })
    .catch((err) => {
      res.render("shop", {
        title: "Shop",
        data: {
          message: "no results",
          categoriesMessage: "no results"
        }
      });
    });
});

// Shop Item Route
app.get("/shop/:id", (req, res) => {
  let viewingCategory = req.query.category || 0;

  let itemPromise = storeService.getItemById(req.params.id);
  let categoryPromise = storeService.getCategories();

  Promise.all([itemPromise, categoryPromise])
    .then(([item, categories]) => {
      res.render("shop", {
        title: "Shop",
        data: {
          post: item,
          posts: [],
          categories: categories,
          viewingCategory: viewingCategory
        }
      });
    })
    .catch((err) => {
      res.render("shop", {
        title: "Shop",
        data: {
          message: "no results",
          categoriesMessage: "no results"
        }
      });
    });
});

// Handle 404 - Page Not Found
app.use((req, res) => {
  res.status(404).render("404");
});

// Initialize store service and start server
storeService
  .initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize store service:", err);
  });