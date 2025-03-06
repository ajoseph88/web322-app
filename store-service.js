const fs = require("fs");

let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/items.json", "utf8", (err, data) => {
            if (err) reject("Unable to read file");
            items = JSON.parse(data);


            fs.readFile("./data/categories.json", "utf8", (err, data) => 
                {
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

//  Add item function
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        
        itemData.published = itemData.published ? true : false;
        
        itemData.id = items.length + 1;
        
        items.push(itemData);
        
        resolve(itemData);
    });
}

//  Get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    });
}

// Get items by minimum date
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(
            item => new Date(item.postDate) >= new Date(minDateStr)
        );
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    });
}

//  Get item by ID
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id == id);
        if (item) {
            resolve(item);
        } else {
            reject("no result returned");
        }
    });
}

module.exports = { 
    initialize, 
    getAllItems, 
    getPublishedItems, 
    getCategories, 
    addItem, 
    getItemsByCategory, 
    getItemsByMinDate, 
    getItemById 
};