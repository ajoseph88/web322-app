const Sequelize = require('sequelize');

const sequelize = new Sequelize('SenecaDB', 'neondb_owner', 'npg_HF1QJfa3ZiXR', {
    host: 'ep-green-term-a5jb8tll-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


// Define Item model
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

// Define Category model
const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// Set up relationship
Item.belongsTo(Category, {foreignKey: 'category'});

module.exports = {
    initialize: function() {
        return new Promise((resolve, reject) => {
            sequelize.sync()
                .then(() => resolve())
                .catch(err => reject("unable to sync the database"));
        });
    },

    getAllItems: function() {
        return new Promise((resolve, reject) => {
            Item.findAll()
                .then(data => resolve(data))
                .catch(err => reject("no results returned"));
        });
    },

    getPublishedItems: function() {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    published: true
                }
            })
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
        });
    },

    getPublishedItemsByCategory: function(category) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    published: true,
                    category: category
                }
            })
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
        });
    },

    getCategories: function() {
        return new Promise((resolve, reject) => {
            Category.findAll()
                .then(data => resolve(data))
                .catch(err => reject("no results returned"));
        });
    },

    addItem: function(itemData) {
        return new Promise((resolve, reject) => {
            // Clean up data
            itemData.published = itemData.published ? true : false;
            for (const prop in itemData) {
                if (itemData[prop] === "") itemData[prop] = null;
            }
            itemData.postDate = new Date();
            
            Item.create(itemData)
                .then(() => resolve())
                .catch(err => reject("unable to create post"));
        });
    },

    getItemsByCategory: function(category) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    category: category
                }
            })
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
        });
    },

    getItemsByMinDate: function(minDateStr) {
        return new Promise((resolve, reject) => {
            const { gte } = Sequelize.Op;
            Item.findAll({
                where: {
                    postDate: {
                        [gte]: new Date(minDateStr)
                    }
                }
            })
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
        });
    },

    getItemById: function(id) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    id: id
                }
            })
            .then(data => resolve(data[0]))
            .catch(err => reject("no result returned"));
        });
    },

    addCategory: function(categoryData) {
        return new Promise((resolve, reject) => {
            // Clean up data
            for (const prop in categoryData) {
                if (categoryData[prop] === "") categoryData[prop] = null;
            }
            
            Category.create(categoryData)
                .then(() => resolve())
                .catch(err => reject("unable to create category"));
        });
    },

    deleteCategoryById: function(id) {
        return new Promise((resolve, reject) => {
            Category.destroy({
                where: {
                    id: id
                }
            })
            .then(() => resolve())
            .catch(err => reject("unable to delete category"));
        });
    },

    deleteItemById: function(id) {
        return new Promise((resolve, reject) => {
            Item.destroy({
                where: {
                    id: id
                }
            })
            .then(() => resolve())
            .catch(err => reject("unable to delete post"));
        });
    }
};