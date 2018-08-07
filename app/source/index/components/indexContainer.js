/**
 * Created by Mike on 4/13/2017.
 */

'use strict';

(process.env.APP_ENV === 'browser') && require('../../../../resources/styles/index.scss');
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    searchBooksAction,
    placeAutocompleteAction,
    setPlaceTextAction,
    setPlaceSlugAction,
    setQueryTextAction,
    setSelectedCategoryAction,
    setInitializedAction,
    setNotFoundAction
} from '../indexActions';
import halson from 'halson';
import queryString from 'query-string';
import PrimarySearch from '../../shared/primarySearch/components/primarySearch';
import {withComponentExtended, withSeo} from '../../hoc';
import {defineMessages, FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl';
import {messages as masterMessages} from '../../master/masterMessages';
import Helmet from 'react-helmet';
import IndexContentContainer from './indexContentContainer';
import NotFound from '../../notFound';

class IndexContainer extends React.Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.reload = false;
        this.state = {
            searchQuery: props.searchQuery,
            placeText: props.placeText,
            placeSlug: props.placeSlug,
            placeFullText: ''
        }
    }

    static getQuery(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.q ? query.q : '';
    }

    static getLang(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.lang ? query.lang : '';
    }

    static getSort(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.sort ? query.sort : '';
    }

    static getPage(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.page ? query.page : '';
    }

    static getPlace(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.place ? query.place : '';
    }

    static getCategory(match) {
        let categorySlug = match.params.category;
        if (categorySlug) {
            categorySlug = categorySlug.replace(/^books\//, '');
        }

        return categorySlug;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            searchQuery: nextProps.searchQuery,
            placeText: nextProps.placeText,
            placeSlug: nextProps.placeSlug,
        })
    }

    componentWillUnmount() {
        let {setInitializedAction, setNotFoundAction} = this.props;

        setInitializedAction(false);
        setNotFoundAction(false);
    }

    onClearSearchQuery = (event) => {
        let {searchBooksAction, sortCriterias, setQueryTextAction} = this.props;
        let {placeSlug, placeFullText} = this.state;

        this.setState({
            [name]: ''
        });

        setQueryTextAction('');

        searchBooksAction({
            searchQuery: '',
            placeSlug: placeSlug ? placeSlug : placeFullText,
            placeText: placeSlug ? placeFullText : '',
            sortQuery: sortCriterias.filter(criteria => criteria.selected).map(criteria => criteria.key),
            history: true,
        }, {track: true});
    }

    onClearAutocomplete = (event) => {
        let {searchBooksAction, sortCriterias, setPlaceSlugAction} = this.props;
        let {searchQuery} = this.state;
        let category = this.getSelectedCategorySlug();
        let facetsParams = this.getSelectedFacets();

        this.setState({
            placeSlug: '',
            placeFullText: ''
        });

        setPlaceSlugAction('');

        searchBooksAction({
            searchQuery,
            placeSlug: '',
            placeText: '',
            sortQuery: sortCriterias.filter(criteria => criteria.selected).map(criteria => criteria.key),
            category,
            facetsParams,
            history: true,
        }, {track: true});
    }

    onSearchChangeHandler = (event) => {
        let {setQueryTextAction} = this.props;

        const {value, name} = event.target;

        this.setState({
            [name]: value
        });

        setQueryTextAction(value);
    }

    onPlaceAutocompleteSelectedValueChanged = (data, placeInputText, meta) => {
        let {setPlaceTextAction, setPlaceSlugAction} = this.props;

        let slug = data ? data.slug : placeInputText;
        let text = data ? data.text : placeInputText;

        this.setState({
            placeSlug: slug,
            placeText: text
        });

        setPlaceTextAction(text);
        setPlaceSlugAction(slug);

        if (!meta) {
            this.onSearchHandler();
        }
    }

    onPlaceAutocompleteHoveredValueChanged = (data, placeInputText) => {
        let {setPlaceSlugAction} = this.props;

        let slug = data ? data.slug : '';
        let fullText = data ? data.text : placeInputText;

        this.setState({
            placeSlug: slug,
            placeFullText: fullText
        });

        setPlaceSlugAction(slug);
    }

    onPlaceAutocompleteInputChanged = (value) => {
        this.setState({
            placeText: value,
            placeFullText: value
        })

        let {placeAutocompleteAction} = this.props;
        placeAutocompleteAction(value);
    }

    getSelectedCategorySlug = () => {
        let {categories} = this.props;

        if (!categories)
            return '';

        let selectedCategory = categories.items.find(c => c.selected);
        if (selectedCategory) {
            return selectedCategory.slug;
        } else if (categories.ancestors.length > 0) {
            return categories.ancestors[categories.ancestors.length - 1].slug;
        }
    }

    getSelectedFacets = () => {
        let {facets} = this.props;
        return facets.reduce((result, facet) => {
            let facetValues = facet.values
                .filter((facetItem) => {
                    return facetItem.selected;
                })
                .map((facetItem) => {
                    return facetItem.key
                })
                .join(',');

            if (facetValues) {
                result[facet.key] = facetValues;
            }

            return result;
        }, {});
    }

    onSearchHandler = () => {
        let {searchBooksAction, sortCriterias, searchResponse} = this.props;
        let {searchQuery, placeSlug, placeFullText} = this.state;
        let category = searchResponse.query == searchQuery && this.getSelectedCategorySlug();
        let facetsParams = searchResponse.query == searchQuery && this.getSelectedFacets();

        searchBooksAction({
            searchQuery,
            placeSlug: placeSlug, //? placeSlug : placeFullText,
            placeText: placeSlug ? placeFullText : '',
            sortQuery: sortCriterias.filter(criteria => criteria.selected).map(criteria => criteria.key),
            category,
            facetsParams,
            history: true,
        }, {track: true});
    }

    buildTitle() {
        let {categories, intl} = this.props;
        let partOfTitle = '';
        let title;

        if (categories) {
            let selectedCategory = categories.items.find(c => c.selected);

            if (selectedCategory) {
                partOfTitle = selectedCategory.name;
            }

            if (categories.ancestors.length > 0) {
                if (partOfTitle) {
                    partOfTitle += ' - ' + categories.ancestors[categories.ancestors.length - 1].name;
                } else {
                    let selectedAncestor = categories.ancestors.find(c => c.selected);
                    if (selectedAncestor) {
                        partOfTitle += selectedAncestor.name;
                    }
                }

            }
        }

        if (partOfTitle != '') {
            title = intl.formatMessage(masterMessages.pageTitle, {
                title: intl.formatMessage(messages.partOfTitle, {
                    partOfTitle
                })
            })
        } else {
            title = intl.formatMessage(messages.pageTitle);
        }

        return title;
    }

    getPlaceText() {
        let {searchPlace} = this.props;

        let terms = searchPlace.terms;
        return terms && terms.length > 0 ? terms[0].text : '';
    }

    buildMetaDescription() {
        let {intl, categories} = this.props;

        let categoryName = ''
        let description;

        if (categories) {
            let selectedCategory = categories.items.find(c => c.selected);
            if (selectedCategory) {
                categoryName = selectedCategory.name;
            } else if (categories.ancestors.length > 0) {
                categoryName = categories.ancestors[categories.ancestors.length - 1].name;
            }
        }

        if (categoryName != '') {
            description = intl.formatMessage(messages.pageMetaDescriptionAlt,
                {
                    category: categoryName
                })
        } else {
            description = intl.formatMessage(masterMessages.pageMetaDescription);
        }

        return description;
    }

    buildHeading() {
        let {searchPlace, intl, user} = this.props;
        const {auth} = this.context;

        let placeText = this.getPlaceText();
        let description;

        if (placeText != '') {
            let hasCityTranslation = messages[searchPlace._id];
            let city;
            if (hasCityTranslation) {
                city = intl.formatMessage(hasCityTranslation);
                description = intl.formatMessage(messages.welcomeByPlace,
                    {
                        place: city
                    })
            } else {
                description = intl.formatMessage(messages.welcomeByPlaceIn,
                    {
                        place: placeText
                    })
            }
        } else {
            description = auth.isAuthenticated ?
                intl.formatMessage(messages.welcomePersonalized, {user: user.name ? user.name.split(' ')[0] : ''}) :
                intl.formatMessage(messages.welcomeDefault);
        }

        return description;
    }

    buildSeoPrevNextURL(isNext, current = false) {
        const {searchResponse, routeResolver, actions} = this.props;
        let queryStringArray = [];
        searchResponse.query && queryStringArray.push(`q=${searchResponse.query}`);
        searchResponse.lang && queryStringArray.push(`lang=${searchResponse.lang}`);
        searchResponse.sort && queryStringArray.push(`sort=${searchResponse.sort}`);
        searchResponse.place && searchResponse.place.slug && queryStringArray.push(`place=${searchResponse.place.slug}`);

        if (!current) {
            isNext ?
                actions.loadMore && queryStringArray.push(`page=${searchResponse.page + 1}`) :
                actions.loadPrev && queryStringArray.push(`page=${searchResponse.page - 1}`);
        }

        let urlToPush = routeResolver.buildRouteFor('index').pathname;
        let queryString = queryStringArray.length > 0 ? `?${queryStringArray.join('&')}` : '';

        if (!searchResponse.category && queryString) {
            urlToPush = `${routeResolver.buildRouteFor('index').pathname}${queryString}`;
        }

        if (searchResponse.category) {
            urlToPush = `${routeResolver.buildRouteFor('index', {
                category: `books/${searchResponse.category}`
            }).pathname}${queryString}`;
        }

        return urlToPush;
    }

    render() {
        const {placesAutocomplete, actions, webDomain, searchButtonLoading, social, categoryNotFound} = this.props;
        const {searchQuery, placeText} = this.state;

        let placesHal = halson(placesAutocomplete.suggestions);
        let placesSuggestionsRes = placesHal.getEmbeds('places');
        let metaDescription = this.buildMetaDescription();
        let title = this.buildTitle();
        let currentPageUrl = this.buildSeoPrevNextURL(undefined, true);

        return categoryNotFound ? <NotFound/> : <div>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={metaDescription}/>
                {
                    actions.loadMore &&
                    <link rel="next" href={`${webDomain}${this.buildSeoPrevNextURL(true)}`}/>
                }
                {
                    actions.loadPrev &&
                    <link rel="prev" href={`${webDomain}${this.buildSeoPrevNextURL(false)}`}/>
                }
                <meta property="og:type" content="website"/>
                <meta property="og:url" content={`${webDomain}${currentPageUrl}`}/>
                <meta property="og:title" content={title}/>
                <meta property="og:description" content={metaDescription}/>
                <meta property="og:image" content={social.facebook.shareImg}/>
                <meta property="fb:app_id" content={social.facebook.appId}/>
            </Helmet>
            <div className="l-indexSearch container">
                <div className="row h-100 align-items-center">
                    <div className="col-12 d-flex flex-column align-items-center">
                        {
                            <h1 className="l-hero d-none d-md-flex">{this.buildHeading()}</h1>
                        }
                        <PrimarySearch
                            className="primarySearch-sm-vertical"
                            loading={searchButtonLoading}
                            searchQuery={searchQuery}
                            placeText={placeText}
                            placesSuggestions={placesSuggestionsRes}
                            onChangeSearchQuery={this.onSearchChangeHandler}
                            onClearSearchQuery={this.onClearSearchQuery}
                            onPlaceAutocompleteSelectedValueChanged={this.onPlaceAutocompleteSelectedValueChanged}
                            onPlaceAutocompleteHoveredValueChanged={this.onPlaceAutocompleteHoveredValueChanged}
                            onPlaceAutocompleteInputValueChanged={this.onPlaceAutocompleteInputChanged}
                            onClearAutocomplete={this.onClearAutocomplete}
                            onSearch={this.onSearchHandler}
                        />
                    </div>
                </div>
            </div>
            <div className="l-line d-none d-md-block"></div>
            <IndexContentContainer/>
        </div>
    }
}

const messages = defineMessages({
    welcomeDefault: {
        id: 'index.welcomeDefault',
        defaultMessage: 'Swap, buy or sell books',
    },
    welcomePersonalized: {
        id: 'index.welcomePersonalized',
        defaultMessage: 'Hey {user}, what book are you looking for?',
    },
    welcomeByPlace: {
        id: 'index.welcomeByPlace',
        defaultMessage: 'Books to swap or buy {place}'
    },
    welcomeByPlaceIn: {
        id: 'index.welcomeByPlaceIn',
        defaultMessage: 'Books to swap or buy in {place}'
    },
    partOfTitle: {
        id: 'index.partOfTitle',
        defaultMessage: '{partOfTitle}, Books'
    },
    pageTitle: {
        id: 'index.pageTitle',
        defaultMessage: 'Liberbee - swap, sell or buy books'
    },
    pageMetaDescriptionAlt: {
        id: 'index.metaDescriptionAlt',
        defaultMessage: 'Swap or buy books in category {category}'
    }
});

const mapStateToProps = (state, props) => {
    return {
        user: state.master.user,
        categoryNotFound: state.index.notFound,
        searchButtonLoading: state.index.search.loading,
        facets: state.index.search.facets,
        actions: state.index.search.actions,
        sortCriterias: state.index.search.sortCriterias,
        categories: state.index.search.categories,
        searchQuery: state.index.search.query,
        placeText: state.index.search.place.text,
        searchPlace: state.index.search.place,
        placeSlug: state.index.search.place.slug,
        placesAutocomplete: state.index.placesAutocomplete,
        searchResponse: state.index.search.response,
        webDomain: state.master.app.webDomain,
        social: state.master.app.social
    }
}

const mapDispatchToProps = {
    searchBooksAction,
    placeAutocompleteAction,
    setPlaceTextAction,
    setPlaceSlugAction,
    setQueryTextAction,
    setSelectedCategoryAction,
    setInitializedAction,
    setNotFoundAction
}

const loadData = (props, context) => {
    let searchQuery = IndexContainer.getQuery(props.location);
    let placeSlug = IndexContainer.getPlace(props.location);
    let langQuery = IndexContainer.getLang(props.location);
    let sortQuery = IndexContainer.getSort(props.location);
    let page = IndexContainer.getPage(props.location);
    let category = IndexContainer.getCategory(props.match);

    let facetsParams = {};
    if (langQuery) {
        facetsParams.lang = langQuery;
    }

    return context.store.dispatch(searchBooksAction({
        searchQuery,
        placeSlug,
        facetsParams,
        sortQuery,
        page,
        category
    }, {searchLoading: false}));
}

export default withComponentExtended('index', [], loadData, {
    canonical: (params) => {
        return params;
    }
}, true, {
    reloadOnPop: false,
    initialized: (context) => {
        context.store.dispatch(setInitializedAction(true));
    }
})(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndexContainer)));
