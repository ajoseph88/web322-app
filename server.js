/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aaron Joseph
*  Student ID: 151757226
*  Date: April 09, 2025
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
app.engine(".hbs", exphbs.engine({
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
      return (lvalue != rvalue) ? options.inverse(this) : options.fn(this);
    },
    formatDate: function(dateObj){
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }
  }
}));
app.set("view engine", ".hbs");

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // required for category form
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split("/")[1])
    ? route.replace(/\/(?!.*)/, "")
    : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Cloudinary config
cloudinary.config({
  cloud_name: "TITLE",
  api_key: "777141267615443",
  api_secret: "YuqEw9ANgcUnOXX8dgO78pKAZRQE",
  secure: true,
});

const upload = multer();

// Home redirect
app.get("/", (req, res) => res.redirect("/shop"));

// Static views
app.get("/about", (req, res) => res.render("about"));

// GET: Add Item form with categories
app.get("/items/add", (req, res) => {
  storeService.getCategories()
    .then((data) => res.render("addItem", { categories: data }))
    .catch(() => res.render("addItem", { categories: [] }));
});

// POST: Add Item
app.post("/items/add", upload.single("featureImage"), (req, res) => {
  const processItem = (imageUrl) => {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body)
      .then(() => res.redirect("/items"))
      .catch(err => res.status(500).send(`Error adding item: ${err}`));
  };

  if (req.file) {
    const streamUpload = (req) => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) resolve(result);
        else reject(error);
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    streamUpload(req).then((uploaded) => processItem(uploaded.url))
      .catch((err) => {
        console.error("Cloudinary error:", err);
        processItem("");
      });
  } else {
    processItem("");
  }
});

// Items View
app.get("/items", (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

  const fetchItems = category
    ? storeService.getItemsByCategory(category)
    : minDate
      ? storeService.getItemsByMinDate(minDate)
      : storeService.getAllItems();

  fetchItems
    .then((data) => data.length > 0
      ? res.render("items", { items: data })
      : res.render("items", { message: "no results" }))
    .catch(() => res.render("items", { message: "no results" }));
});

// DELETE: Item
app.get("/items/delete/:id", (req, res) => {
  storeService.deleteItemById(req.params.id)
    .then(() => res.redirect("/items"))
    .catch(() => res.status(500).send("Unable to Remove Post / Post not found"));
});

// Item JSON route
app.get("/item/:id", (req, res) => {
  storeService.getItemById(req.params.id)
    .then(item => res.json(item))
    .catch(err => res.status(404).json({ message: err }));
});

// Categories View
app.get("/categories", (req, res) => {
  storeService.getCategories()
    .then((data) => data.length > 0
      ? res.render("categories", { categories: data })
      : res.render("categories", { message: "no results" }))
    .catch(() => res.render("categories", { message: "no results" }));
});

// GET: Add Category
app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

// POST: Add Category
app.post("/categories/add", (req, res) => {
  storeService.addCategory(req.body)
    .then(() => res.redirect("/categories"))
    .catch(() => res.status(500).send("Unable to create category"));
});

// DELETE: Category
app.get("/categories/delete/:id", (req, res) => {
  storeService.deleteCategoryById(req.params.id)
    .then(() => res.redirect("/categories"))
    .catch(() => res.status(500).send("Unable to Remove Category / Category not found"));
});

// Shop View
app.get("/shop", (req, res) => {
  const viewingCategory = req.query.category || 0;

  const itemPromise = viewingCategory
    ? storeService.getPublishedItemsByCategory(viewingCategory)
    : storeService.getPublishedItems();

  Promise.all([itemPromise, storeService.getCategories()])
    .then(([items, categories]) => {
      const post = items.length > 0 ? items[0] : null;
      res.render("shop", {
        title: "Shop",
        data: { post, posts: items, categories, viewingCategory }
      });
    })
    .catch(() => {
      res.render("shop", {
        title: "Shop",
        data: {
          message: "no results",
          categoriesMessage: "no results"
        }
      });
    });
});

// Shop Item View
app.get("/shop/:id", (req, res) => {
  const viewingCategory = req.query.category || 0;

  Promise.all([
    storeService.getItemById(req.params.id),
    storeService.getCategories()
  ])
    .then(([post, categories]) => {
      res.render("shop", {
        title: "Shop",
        data: { post, posts: [], categories, viewingCategory }
      });
    })
    .catch(() => {
      res.render("shop", {
        title: "Shop",
        data: {
          message: "no results",
          categoriesMessage: "no results"
        }
      });
    });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404");
});

// Start server
storeService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize store service:", err);
  });
