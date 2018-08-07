/**
 * Created by Mike on 5/9/2017.
 */
import StyleLoader from '../../../utils/styleLoader';
import SignInContainer from '../master/signin/components/signInContainer';
import SignUpContainer from '../master/signup/components/signUpContainer';
import TermsContainer from '../terms/components/termsContainer';
import ContactsContainer from '../contacts/components/contactsContainer';

export const buildRoutes = (localeResolver) => [
    {
        id: 'contacts',
        path: `${localeResolver.getLocalePath()}/contacts`,
        component: ContactsContainer
    },
    {
        id: 'terms',
        path: `${localeResolver.getLocalePath()}/terms`,
        component: TermsContainer
    },
    {
        id: 'help',
        path: `${localeResolver.getLocalePath()}/help`,
        componentLoader: process.env.APP_ENV === 'browser' ?
            require('bundle-loader?lazy&name=help!../help/helpApp') :
            require('../help/helpApp').default
    },
    {
        id: 'login',
        path: `${localeResolver.getLocalePath()}/login`,
        component: SignInContainer
    },
    {
        id: 'signup',
        path: `${localeResolver.getLocalePath()}/signup`,
        component: SignUpContainer
    },
    {
        id: 'addBook',
        path: `${localeResolver.getLocalePath()}/addbook`,
        authLevel: 1,
        styleLoader: new StyleLoader('addBook'),
        componentLoader: process.env.APP_ENV === 'browser' ?
            require('bundle-loader?lazy&name=addBook!../addBook/addBookApp') :
            require('../addBook/addBookApp').default
    },
    {
        id: 'user',
        path: `${localeResolver.getLocalePath()}/users/:user`,
        styleLoader: new StyleLoader('user'),
        componentLoader: process.env.APP_ENV === 'browser' ?
            require('bundle-loader?lazy&name=user!../user/userApp') :
            require('../user/userApp').default
    }, {
        id: 'draftBook',
        authLevel: 1,
        path: `${localeResolver.getLocalePath()}/draft/:draftBook`,
        styleLoader: new StyleLoader('draftBook'),
        componentLoader: process.env.APP_ENV === 'browser' ?
            require('bundle-loader?lazy&name=draftBook!../draftBook/draftBookApp') :
            require('../draftBook/draftBookApp').default
    }, {
        id: 'messages',
        authLevel: 1,
        path: `${localeResolver.getLocalePath()}/messages/:type/:data?`,
        styleLoader: new StyleLoader('messages'),
        componentLoader: process.env.APP_ENV === 'browser' ?
            require('bundle-loader?lazy&name=messages!../messages/messagesApp') :
            require('../messages/messagesApp').default
    }, {
        id: 'index',
        path: `${localeResolver.getLocalePath()}/:category(books/.*)?`,
        exact: true,
        styleLoader: new StyleLoader('index'),
        componentLoader: process.env.APP_ENV === 'browser' ?
            require('bundle-loader?lazy&name=index!../index/indexApp') :
            require('../index/indexApp').default
    }, {
        id: 'bookInfo',
        exact: true,
        path: `${localeResolver.getLocalePath()}/:book`,
        styleLoader: new StyleLoader('bookInfo'),
        componentLoader: process.env.APP_ENV === 'browser' ?
            require('bundle-loader?lazy&name=bookInfo!../bookInfo/bookInfoApp') :
            require('../bookInfo/bookInfoApp').default
    },


];