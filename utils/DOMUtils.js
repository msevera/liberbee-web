class DOMUtils {

    constructor() {
        this.bodyFreezeScrollTop;
        this.bodyFreezed = false;
        this.freezers = {};
    }

    freezeBody(id, fixBodyClass) {
        if (typeof document == 'undefined' || this.bodyFreezed)
            return;

        if (id){
            this.freezers[id] = true;
        }

        this.bodyFreezed = true;
        this.bodyFreezeScrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        this.addClass(document.documentElement, 'l-fix');
        if (fixBodyClass){
            this.addClass(document.documentElement, fixBodyClass);
        }

        document.body.style.top = -this.bodyFreezeScrollTop + 'px';
    }

    unfreezeBody(id, fixBodyClass) {
        if (typeof document == 'undefined' || !this.bodyFreezed)
            return

        if (id && !this.freezers[id]){
            return;
        }

        delete this.freezers[id];

        this.bodyFreezed = false;
        this.removeClass(document.documentElement, 'l-fix');
        if (fixBodyClass){
            this.removeClass(document.documentElement, fixBodyClass);
        }
        window.scrollBy(0, this.bodyFreezeScrollTop);
        document.body.style.top = null;
    }

    hasClass(el, classToCheck) {
        if (typeof document == 'undefined')
            return;

        return el.className.split(' ').indexOf(classToCheck) >= 0;
    }

    addClass(el, className, successCallback) {
        if (typeof document == 'undefined')
            return;

        if (!this.hasClass(el, className)) {
            el.className += ' ' + className + ' ';
            if (typeof successCallback === 'function') {
                successCallback();
            }
        }
    }

    removeClass(el, className, successCallback) {
        if (typeof document == 'undefined')
            return;

        if (this.hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
            if (typeof successCallback === 'function') {
                successCallback();
            }
        }
    }
}

module.exports = new DOMUtils();

