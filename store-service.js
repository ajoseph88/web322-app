const fs = require("fs");

let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/items.json", "utf8", (err, data) => {
            if (err) reject("Unable to read file");
            items = JSON.parse(data);

            fs.readFile("./data/categories.json", "utf8", (err, data) => {
                if (err) reject("Unable to read file");
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) resolve(items);
        else reject("No results returned");
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        let publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) resolve(publishedItems);
        else reject("No results returned");
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) resolve(categories);
        else reject("No results returned");
    });
}

module.exports = { initialize, getAllItems, getPublishedItems, getCategories };
