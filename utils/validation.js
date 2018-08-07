/**
 * Created by Mike on 9/5/2017.
 */

let required = (value) => {
    if (!!(typeof value !== 'undefined') && value != null)
    {
        if (Array.isArray(value))
        {
            return value.length > 0;
        }else{
            return !!value.toString().trim().length;
        }
    }

    //return !!(typeof value !== 'undefined') && value != null && value.toString().length;
}
module.exports.required = required;

module.exports.year = (value) => {
    if (!value)
        return true;

    let yearRegex = /^\d{4}$/;
    return yearRegex.test(value);
}

module.exports.email = (email) => {
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
};

module.exports.decimal = (value) => {
    let decimalRegex = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/
    return decimalRegex.test(value);
}

module.exports.password = (password) => {
    return password && password.length >= 6;
};

let limitCharsTo = (value, limit) => {
    if (!value)
        return true;

    return value.length <= limit;
}

module.exports.limitCharsTo = (limit) => {
    return (value) => {
        return limitCharsTo(value, limit);
    }
};

let limitCharsFromTo = (value, from, to) => {
    return value && value.length >= from && value.length <= to;
}
module.exports.limitCharsFromTo = (from, to) => {
    return (value) => {
        return limitCharsFromTo(value, from, to);
    }
};

let limitWordsFrom = (value, from) => {
    if (!value)
        return false;

    let words = value.trim().split(' ').filter(c => !!c);

    return words.length >= from;
}
module.exports.limitWordsFrom = (from) => {
    return (value) => {
        return limitWordsFrom(value, from);
    }
};

let isbn10 = (value) => {
    if (!value)
        return true;

    value = value.replace(/-/g, '').trim();

    return value.length == 10;
}

let isbn10Multiple = (separator) => {
    return (value) => {
        if (!value)
            return true;

        let isbnArr = value.split(separator);
        return isbnArr.every(i => isbn10(i));
    }
}

let isbn13 = (value) => {
    if (!value)
        return true;

    value = value.replace(/-/g, '').trim();

    return value.length == 13;
}

let isbn13Multiple = (separator) => {
    return (value) => {
        if (!value)
            return true;

        let isbnArr = value.split(separator);
        return isbnArr.every(i => isbn13(i));
    }
}

let isbn = (isbn) => {
    if (!isbn)
        return true;

    isbn = isbn.replace(/-/g, '');

    return isbn10(isbn) || isbn13(isbn);
}

let isbnMultiple = (separator) => {
    return (value) => {
        if (!value)
            return true;

        let isbnArr = value.split(separator);
        return isbnArr.every(i => isbn(i));
    }
}

module.exports.isbn = isbn;
module.exports.isbnMultiple = isbnMultiple;

module.exports.isbn10 = isbn10;

module.exports.isbn13 = isbn13;
module.exports.isbn10Multiple = isbn10Multiple;
module.exports.isbn13Multiple = isbn13Multiple;

let stripHTMLTags = (html, replace='') => {
    var regex = /(<([^>]+)>)/ig;
    return html.replace(regex, replace);
}

module.exports.htmlRequired = (value) => {
    if ((!!typeof value === 'undefined') && (value != null)) return false;

    value = stripHTMLTags(value);
    return required(value);
}

module.exports.htmlLimitCharsTo = (limit) => {
    return (value) => {
        if (!value) {
            return true;
        }

        value = stripHTMLTags(value);
        return limitCharsTo(value, limit);
    }
}

module.exports.htmlLimitWordsFrom = (limit) => {
    return (value) => {
        if (!value) {
            return false;
        }

        value = stripHTMLTags(value, ' ');
        return limitWordsFrom(value, limit);
    }
}