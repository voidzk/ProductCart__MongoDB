const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
    });
};

exports.postAddProduct = (req, res, next) => {
    const p = {
        Title: req.body.title,
        Price: req.body.price,
        Desc: req.body.description,
        ImageUrl: req.body.imageUrl,
        prodId: null,
        userId: req.user._id,
    };

    const product = new Product(...Object.values(p));
    return product
        .save()
        .then(result => {
            // console.log(result);
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    console.log('calling here-------------------------------');
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    // Product.findByPk(prodId)
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postEditProduct = (req, res, next) => {
    console.log('EDITING--------------- \n');

    const updatedProduct = {
        updatedTitle: req.body.title,
        updatedPrice: req.body.price,
        updatedDesc: req.body.description,
        updatedImageUrl: req.body.imageUrl,
        updatedId: req.body.productId,
    };
    console.log(updatedProduct);
    const product = new Product(...Object.values(updatedProduct));
    return product
        .save()

        .then(result => {
            console.log('done');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getProducts = (req, res, next) => {
    // Product.findAll()
    Product.fetchAll().then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        });
    });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    return Product.deleteById(prodId)

        .then(() => {
            console.log('product deleted!');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};
