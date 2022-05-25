const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
const Product = require('./product');
class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
        // this._id = id ? new mongodb.ObjectId(id) : null;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    static findById(userId) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) });
    }
    //!------------------------------------------------
    //*-----------------------=CART=-----------------------
    //----------------
    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(p => p.productId);

        return db
            .collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items.find(i => {
                            return (
                                i.productId.toString() ===
                                p._id.toString()
                            );
                        }).quantity,
                    };
                });
            });
    }

    updateCart(cart) {
        const updatedCart = {
            items: cart,
        };
        const db = getDb();
        return db.collection('users').updateOne(
            {
                _id: new mongodb.ObjectId(this._id),
            },
            { $set: { cart: updatedCart } }
        );
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(
            cp => cp.productId.toString() === product._id.toString()
        );

        let newQuantity = 1;

        const updatedCartItems = [...this.cart.items];
        if (cartProductIndex >= 0) {
            newQuantity =
                this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id),
                quantity: newQuantity,
            });
        }
        return this.updateCart(updatedCartItems);
        // const updatedCart = {
        //     items: updatedCartItems,
        // };
        // const db = getDb();
        // return db.collection('users').updateOne(
        //     {
        //         _id: new mongodb.ObjectId(this._id),
        //     },
        //     { $set: { cart: updatedCart } }
        // );
    }

    deleteItemFromCart(productId) {
        const updatedCartItems = this.cart.items.filter(
            item => item.productId.toString() !== productId.toString()
        );
        return this.updateCart(updatedCartItems);
    }
    //!------------------------------------------------
    //*-----------------------=ORDER=-----------------------
    //----------------
    addOrder() {
        const db = getDb();
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name,
                    },
                };
                return db.collection('orders').insertOne(order);
            })
            .then(() => {
                this.cart = { items: [] };
                return this.updateCart([]);
            });
    }

    getOrders() {
        const db = getDb();
        return db
            .collection('orders')
            .find({ 'user._id': new mongodb.ObjectId(this._id) })
            .toArray();
    }
}

module.exports = User;
