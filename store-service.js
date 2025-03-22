const fs = require("fs");

let items = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/items.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading items.json:", err); 
        reject("Unable to read file");
      } else {
        items = JSON.parse(data);
        console.log("Items loaded successfully:", items); 
        fs.readFile("./data/categories.json", "utf8", (err, data) => {
          if (err) {
            console.error("Error reading categories.json:", err); 
            reject("Unable to read file");
          } else {
            categories = JSON.parse(data);
            console.log("Categories loaded successfully:", categories); 
            resolve();
          }
        });
      }
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

function getPublishedItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    let publishedItems = items.filter(
      item => item.published === true && item.category == category
    );
    if (publishedItems.length > 0) resolve(publishedItems);
    else reject("no results returned");
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) resolve(categories);
    else reject("No results returned");
  });
}

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = itemData.published ? true : false;
    itemData.id = items.length + 1;

   
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    itemData.postDate = `${year}-${month}-${day}`;

    items.push(itemData);
    console.log("New item added:", itemData); 
    resolve(itemData);
  });
}

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
  getPublishedItemsByCategory,
  getCategories,
  addItem,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById
};