let halson = require('halson');

class EnhancedEcommerce {
    constructor(enabled) {
        this.enabled = enabled;
    }

    refund(dealRequestId, bookCopy) {
        if (!this.enabled)
            return;

        let bookCopyHal = halson(bookCopy);
        let book = bookCopyHal.getEmbed('book');
        let bookHal = halson(book);

        let productObj = {
            id: bookHal.slug,
            quantity: 1
        }

        window.dataLayer.push({
            event: 'refund',
            ecommerce: {
                refund: {
                    actionField: {
                        id: dealRequestId
                    },
                    products: [productObj]
                }
            }
        });
    }

    purchase(dealRequestId, bookCopy) {
        if (!this.enabled)
            return;

        let bookCopyHal = halson(bookCopy);
        let book = bookCopyHal.getEmbed('book');
        let bookHal = halson(book);
        let publishers = bookHal.getEmbeds('publishers');
        let categoryPath = bookHal.getEmbeds('categoryPath');

        let productObj = {
            name: bookHal.title,
            id: bookHal.slug,
            quantity: 1,
            price: bookCopyHal.deal.amount
        }

        this._buildBrand(productObj, publishers);
        this._buildCategory(productObj, categoryPath);

        window.dataLayer.push({
            event: 'purchase',
            ecommerce: {
                currencyCode: bookCopyHal.geo.currencyCode,
                purchase: {
                    actionField: {
                        id: dealRequestId,
                        affiliation: 'Web Site Store',
                        revenue: bookCopyHal.deal.amount,
                    },
                    products: [productObj]
                }
            }
        });
    }

    checkout(bookCopies) {
        if (!this.enabled)
            return;

        if (!bookCopies.length)
            return;

        let products = bookCopies.map((bookCopy) => {
            let bookCopyHal = halson(bookCopy);
            let book = bookCopyHal.getEmbed('book');
            let bookHal = halson(book);
            let publishers = bookHal.getEmbeds('publishers');
            let categoryPath = bookHal.getEmbeds('categoryPath');

            let productObj = {
                name: bookHal.title,
                id: bookHal.slug,
                quantity: 1,
                price: bookCopyHal.deal.amount
            }

            this._buildBrand(productObj, publishers);
            this._buildCategory(productObj, categoryPath);

            return productObj;
        });

        window.dataLayer.push({
            event: 'checkout',
            ecommerce: {
                checkout: {
                    actionField: {
                        step: 1
                    },
                    products
                }
            }
        });
    }

    removeFromCart(bookCopies) {
        if (!this.enabled)
            return;

        if (!bookCopies.length)
            return;

        let products = bookCopies.map((bookCopy) => {
            let bookCopyHal = halson(bookCopy);
            let book = bookCopyHal.getEmbed('book');
            let bookHal = halson(book);
            let publishers = bookHal.getEmbeds('publishers');
            let categoryPath = bookHal.getEmbeds('categoryPath');

            let productObj = {
                name: bookHal.title,
                id: bookHal.slug,
                quantity: 1,
                price: bookCopyHal.deal.amount
            }

            this._buildBrand(productObj, publishers);
            this._buildCategory(productObj, categoryPath);

            return productObj;
        });

        window.dataLayer.push({
            event: 'removeFromCart',
            ecommerce: {
                remove: {
                    products
                }
            }
        });
    }

    addToCart(bookCopy) {
        if (!this.enabled)
            return;

        let bookCopyHal = halson(bookCopy);
        let book = bookCopyHal.getEmbed('book');
        let bookHal = halson(book);
        let publishers = bookHal.getEmbeds('publishers');
        let categoryPath = bookHal.getEmbeds('categoryPath');

        let productObj = {
            name: bookHal.title,
            id: bookHal.slug,
            quantity: 1,
            price: bookCopyHal.deal.amount
        }

        this._buildBrand(productObj, publishers);
        this._buildCategory(productObj, categoryPath);

        window.dataLayer.push({
            event: 'addToCart',
            ecommerce: {
                currencyCode: bookCopyHal.geo.currencyCode,
                add: {
                    products: [productObj]
                }
            }
        })
    }

    productView(book) {
        if (!this.enabled)
            return;

        let bookHal = halson(book);
        let publishers = bookHal.getEmbeds('publishers');
        let categoryPath = bookHal.getEmbeds('categoryPath');

        let productObj = {
            name: bookHal.title,
            id: bookHal.slug
        }

        this._buildBrand(productObj, publishers);
        this._buildCategory(productObj, categoryPath);

        window.dataLayer.push({
            event: 'productView',
            ecommerce: {
                detail: {
                    actionField: {
                        list: 'Book Info'
                    },
                    products: [productObj]
                }
            }
        })
    }

    userBookCopyClick(bookCopy, index) {
        if (!this.enabled)
            return;

        let bookCopyHal = halson(bookCopy);
        let book = bookCopyHal.getEmbed('book');
        let bookHal = halson(book);
        let publishers = bookHal.getEmbeds('publishers');
        let categoryPath = bookHal.getEmbeds('categoryPath');

        let productObj = {
            name: bookHal.title,
            id: bookHal.slug,
            price: bookCopyHal.deal.amount,
            position: index
        }

        this._buildBrand(productObj, publishers);
        this._buildCategory(productObj, categoryPath);

        window.dataLayer.push({
            event: 'productClick',
            ecommerce: {
                click: {
                    actionField: {
                        list: `user_${bookCopyHal.user}`,
                    },
                    products: [productObj]
                }
            }
        })
    }

    productClick(book, productList, index, page, pageSize) {
        if (!this.enabled)
            return;

        let bookHal = halson(book);
        let publishers = bookHal.getEmbeds('publishers');
        let categoryPath = bookHal.getEmbeds('categoryPath');

        let productObj = {
            name: bookHal.title,
            id: bookHal.slug,
            position: (page - 1) * pageSize + index
        }

        this._buildBrand(productObj, publishers);
        this._buildCategory(productObj, categoryPath);

        window.dataLayer.push({
            event: 'productClick',
            ecommerce: {
                click: {
                    actionField: {
                        list: productList ? productList : 'root',
                    },
                    products: [productObj]
                }
            }
        })
    }

    userBookCopiesImpressions(bookCopies) {
        if (!this.enabled)
            return;

        if (!bookCopies.length)
            return;

        let currencyCode;
        let impressions = bookCopies.map((bookCopy, index) => {
            let bookCopyHal = halson(bookCopy);
            let book = bookCopyHal.getEmbed('book');
            let bookHal = halson(book);
            let publishers = bookHal.getEmbeds('publishers');
            let categoryPath = bookHal.getEmbeds('categoryPath');

            let impressionObj = {
                name: bookHal.title,
                id: bookHal.slug,
                price: bookCopyHal.deal.amount,
                list: `user_${bookCopyHal.user}`,
                position: index
            }

            this._buildBrand(impressionObj, publishers);
            this._buildCategory(impressionObj, categoryPath);

            currencyCode = bookCopyHal.geo.currencyCode;

            return impressionObj;
        })

        window.dataLayer.push({
            event: 'showImpressions',
            ecommerce: {
                currencyCode,
                impressions
            }
        })
    }

    impressions(books, productList, page, pageSize) {
        if (!this.enabled)
            return;

        if (!books.length)
            return;

        let impressions = books.map((book, index) => {
            let bookHal = halson(book);
            let publishers = bookHal.getEmbeds('publishers');
            let categoryPath = bookHal.getEmbeds('categoryPath');

            let impressionObj = {
                name: bookHal.title,
                id: bookHal.slug,
                list: productList ? productList : 'root',
                position: (page - 1) * pageSize + index
            }

            this._buildBrand(impressionObj, publishers);
            this._buildCategory(impressionObj, categoryPath);

            return impressionObj;
        })

        window.dataLayer.push({
            event: 'showImpressions',
            ecommerce: {
                impressions
            }
        })
    }

    setInitial(state) {
        if (!this.enabled)
            return;

        if (state.index) {
            this.impressions(state.index.search.books,
                state.index.search.response.category,
                state.index.search.response.page,
                state.index.search.response.size);
        }

        if (state.userData) {
            let loggedUserSlug = state.master.user.slug;
            if (!loggedUserSlug || loggedUserSlug != state.userData.user.slug) {
                this.userBookCopiesImpressions(state.userData.books.bookCopies);
            }
        }

        if (state.bookInfo) {
            this.productView(state.bookInfo.rawBook);
        }
    }

    _buildBrand(obj, publishers) {
        if (publishers.length > 0) {
            obj.brand = publishers[0].slug;
        }
    }

    _buildCategory(obj, categoryPath) {
        if (categoryPath.length > 0) {
            obj.category = categoryPath.reverse().map(c => c.slug).join('/')
        }
    }
}

module.exports = EnhancedEcommerce;