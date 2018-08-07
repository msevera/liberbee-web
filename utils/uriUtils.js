/**
 * Created by Mike on 7/6/2017.
 */

class URIUtils {
     static bindParams(uri, params){
        let match, replacement;

        while (match = /:([\w_]+)\??/ig.exec(uri)) {
            replacement = params[match[1]] || '';
            if (replacement === '') {
                uri = uri.replace('/' + match[0], '');
            } else {
                uri = uri.replace(match[0], replacement);
            }
        }

        return uri;
    }
}

module.exports = URIUtils;