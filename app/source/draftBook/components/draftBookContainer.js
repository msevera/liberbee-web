/**
 * Created by Mike on 9/20/2017.
 */


'use strict';

(process.env.APP_ENV === 'browser') && require('../../../../resources/styles/draftBook.scss');
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    loadDraftBookAction,
    removeDraftBookAction,
    searchBookAction,
    copyDraftBookRevisionAction,
    saveDraftBookRevisionAction,
    publishDraftBookRevisionAction,
    removeBookAssociationAction,
    assignDraftToUserAction,
    removeAssigneeAction,
    resetFormsAction,
    setDraftBookInitializedAction
} from '../draftBookActions';
import {Link} from 'react-router-dom';
import FormGroupInput from '../../shared/form/components/formGroupInput';
import {submitForm, resetModelToInitial, getForm, setFormItem} from '../../shared/validation/actions';
import {required, year, isbn10, isbn13, isbn10Multiple, isbn13Multiple} from '../../../../utils/validation';
import coverBuilder from '../../../../utils/coverBuilder';
import halson from 'halson';
import CoverUpload from '../../shared/coverUpload/components/coverUpload';
import AssociateBookContainer from '../associateBook/components/associateBookContainer';
import PopupFull from '../../shared/popup/components/popupFull';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {withComponentExtended} from '../../hoc';
import {messages as masterMessages} from '../../master/masterMessages';
import {messages as formMesages} from '../../shared/form/messages';
import {messages as validationMessages} from '../../shared/validation/messages';
import Helmet from 'react-helmet';
import CategorySelectorContainer from '../../shared/categorySelector/components/categorySelectorContainer';
import {showCreateEditPublisherPopupAction} from '../../shared/createEditPublisher/createEditPublisherActions';
import {showSelectCategoryPopupAction} from '../../shared/categorySelector/categorySelectorActions';
import KeywordsSelector from './keywordsSelector';
import Error from '../../shared/validation/components/error';
import AuthorsSelector from '../authorsSelector/components/authorsSelectorContainer';
import PublishersSelector from '../publishersSelector/components/publishersSelectorContainer';
import LoadButton from '../../shared/button/components/loadButton';
import PageLoader from "../../shared/empty/components/pageLoader";
import FormGroupChecked from '../../shared/form/components/formGroupChecked';

class DraftBookContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    static getBook(match) {
        let draftBookId = match.params.draftBook;

        return draftBookId ? draftBookId : '';
    }

    constructor(props) {
        super();

        this.publishValidators = {
            isbn10: {
                isbn10Multiple: isbn10Multiple(',')
            },
            isbn13: {
                isbn13Multiple: isbn13Multiple(',')
            },
            title: {
                required
            },
            authors: {},
            publishers: {
                required
            },
            publishDate: {
                year,
                required
            },
            categories: {
                required
            },
            languages: {
                required
            },
            pages: {},
            bindings: {},
            keywords: {},
            description: {}
        }

        this.saveValidators = {
            isbn10: {
                isbn10Multiple: isbn10Multiple(',')
            },
            isbn13: {
                isbn13Multiple: isbn13Multiple(',')
            },
            title: {},
            authors: {},
            publishers: {},
            publishDate: {
                year
            },
            categories: {},
            languages: {},
            pages: {},
            bindings: {},
            keywords: {},
            description: {}
        }

        let activeRevision = props.revisions.length > 0 ? this._revisionToForm(props.revisions[0], props) : {source: null};

        this.state = {
            file: null,
            coverImage: activeRevision.source && activeRevision.source.data.cover ? activeRevision.source.data.cover : '',
            category: activeRevision.source ? activeRevision.data.category : null,
            keywords: activeRevision.source ? activeRevision.data.keywords : [],
            removeCover: false,
            activeRevision,
            showAssociatePopup: false,
            revisions: [],
            authors: activeRevision.source && activeRevision.source.data.authors ? activeRevision.source.data.authors : [],
            publishers: activeRevision.source && activeRevision.source.data.publishers ? [...activeRevision.source.data.publishers] : []
        }
    }

    _initFromArr(arr) {
        return arr && arr.length > 0 ? arr[0] : '';
    }

    _revisionToForm(revision, props) {
        let {intl} = props ? props : this.props;
        let category = this._initFromArr(revision.data.categories);
        return {
            key: revision._id,
            data: {
                cover: revision.data.cover,
                category,
                keywords: revision.data.keywords,
                file: null,
                removeCover: false,
                form: {
                    title: revision.data.title,
                    authors: revision.data.authors,
                    publishers: revision.data.publishers.filter(i => !!i.name),
                    publishDate: revision.data.publishDate ? new Date(revision.data.publishDate).getFullYear().toString() : null,
                    isbn10: revision.data.isbn10.join(', '),
                    isbn13: revision.data.isbn13.join(', '),
                    languages: revision.data.languages.join(', '),
                    bindings: revision.data.bindings.join(', '),
                    categories: category ? category._id : '',
                    description: revision.data.description,
                    pages: revision.data.pages,
                    popularity: revision.data.popularityItem,
                }
            },
            source: revision
        }
    }

    loadFormData(activeRevision) {
        let {store} = this.context;
        let initialData = {};

        if (activeRevision.source) {
            initialData = activeRevision.data.form;
        }

        return store.dispatch(resetModelToInitial({model: 'draftBook.bookModel', initialData}));
    }

    componentWillMount() {
        let {activeRevision} = this.state;
        this.loadFormData(activeRevision)
    }

    componentWillUnmount() {
        let {resetFormsAction, setDraftBookInitializedAction} = this.props;

        resetFormsAction();
        setDraftBookInitializedAction(false);
    }

    componentWillReceiveProps(nextProps) {
        let {activeRevision} = this.state;
        let {_id} = this.props;
        let {store} =this.context;

        let newActiveRevision;
        if (_id != nextProps._id) {
            newActiveRevision = nextProps.revisions[0];
        } else {
            if (!activeRevision.source) {
                newActiveRevision = nextProps.revisions[0];
            } else {
                newActiveRevision = nextProps.revisions.find((rev) => {
                    return rev._id == activeRevision.source._id;
                })
            }
        }

        let newState = {}

        newActiveRevision = this._revisionToForm(newActiveRevision)
        if (!activeRevision.source || activeRevision.source.created != newActiveRevision.source.created || activeRevision.source.updatedAt != newActiveRevision.source.updatedAt)  {
            newState.activeRevision = newActiveRevision;
            newState.coverImage = newActiveRevision && newActiveRevision.data.cover ? newActiveRevision.data.cover : '';
            newState.category = newActiveRevision && newActiveRevision.data.category ? newActiveRevision.data.category : '';
            newState.keywords = newActiveRevision && newActiveRevision.data.keywords ? newActiveRevision.data.keywords : [];
            newState.file = null;
            newState.removeCover = false;
            this.loadFormData(newActiveRevision)
        } else {
            newState.activeRevision = {
                ...activeRevision,
                source: newActiveRevision.source
            }
        }

        newState.authors = newActiveRevision.source.data.authors;
        newState.publishers = newActiveRevision.source.data.publishers;

        this.setState(newState)
    }

    removeDraftBook = () => {
        let {removeDraftBookAction, intl} = this.props;
        removeDraftBookAction(intl);
    }

    onDropAccepted = (acceptedFiles) => {
        let reader = new FileReader();
        let file = acceptedFiles[0];

        reader.onloadend = () => {
            this.setState({
                file,
                coverImage: reader.result,
                removeCover: false,
            })
        }

        reader.readAsDataURL(file);
    }

    removeCover = () => {
        this.setState({
            file: null,
            coverImage: '',
            removeCover: true
        })
    }

    changeActiveRevision(revision) {
        let {activeRevision, revisions, coverImage, file, removeCover, category, keywords} = this.state;
        let {store} = this.context;

        store.dispatch(getForm({
            model: 'draftBook.bookModel'
        }))
            .then((form) => {
                let updatedRevisions = [];
                let oldActiveRevision = revisions.find(rev => rev.key == activeRevision.key);
                if (!oldActiveRevision) {
                    updatedRevisions = [...revisions];
                    updatedRevisions.push({
                        ...activeRevision,
                        data: {
                            ...activeRevision.data,
                            form,
                            cover: coverImage,
                            file,
                            removeCover,
                            category,
                            keywords
                        }
                    });
                } else {
                    updatedRevisions = revisions.map((rev) => {
                        if (rev.key == activeRevision.key) {
                            return {
                                ...activeRevision,
                                data: {
                                    ...activeRevision.data,
                                    form,
                                    cover: coverImage,
                                    file,
                                    removeCover,
                                    category,
                                    keywords
                                }
                            };
                        }

                        return rev;
                    });
                }

                let newActiveRevision = updatedRevisions.find(rev => rev.key == revision._id);
                newActiveRevision = newActiveRevision ?
                    {
                        ...newActiveRevision,
                        source: {
                            ...revision
                        }
                    } :
                    this._revisionToForm(revision);

                this.setState({
                    file: newActiveRevision.data.file,
                    category: newActiveRevision.data.category,
                    keywords: newActiveRevision.data.keywords,
                    coverImage: newActiveRevision.data.cover ? newActiveRevision.data.cover : '',
                    removeCover: newActiveRevision.data.removeCover,
                    activeRevision: newActiveRevision,
                    revisions: updatedRevisions,
                    authors: newActiveRevision.source.data.authors,
                    publishers: newActiveRevision.source.data.publishers,
                    popularity: newActiveRevision.source.data.popularity
                })

                this.loadFormData(newActiveRevision);
            });

    }

    _formatDataObj = (form) => {
        let {file, coverImage, removeCover, keywords, authors, publishers} = this.state;

        let dataObj = {};

        if (file) {
            dataObj.cover = coverImage;
        }

        if (form.publishDate) {
            dataObj.publishDate = form.publishDate;
        }

        if (form.pages) {
            dataObj.pages = form.pages;
        }

        if (form.description) {
            dataObj.description = form.description;
        }

        if (form.title) {
            dataObj.title = form.title;
        }

        if (form.isbn10) {
            dataObj.isbn10 = form.isbn10.split(',').map(i => i.trim().replace(/\s|\-/g, ''));
        }

        if (form.isbn13) {
            dataObj.isbn13 = form.isbn13.split(',').map(i => i.trim().replace(/\s|\-/g, ''));
        }

        if (authors) {
            dataObj.authors = authors.filter(a => !!a.name).map(a => a.name);
        }

        if (publishers) {
            dataObj.publishers = publishers.filter(a => !!a.name).map(a => a.name);
        }

        if (form.languages) {
            dataObj.languages = form.languages.split(',').map(i => i.trim());
        }

        if (form.bindings) {
            dataObj.bindings = form.bindings.split(',').map(i => i.trim());
        }

        if (form.categories) {
            dataObj.categories = [form.categories.trim()]
        }

        if (form.popularity) {
            dataObj.popularity = form.popularity;
        }

        if (removeCover) {
            dataObj.removeCover = removeCover;
        }

        if (keywords.length > 0) {
            dataObj.keywords = this._filterKeywords(keywords);
        }

        return dataObj;
    }

    _filterKeywords(keywords) {
        return keywords
            .map((keyword) => {
                let resultKeyword = Object.keys(keyword).reduce((result, item, index) => {
                    let value = keyword[item];
                    if (value) {
                        result[item] = value;
                    }

                    return result;
                }, {})

                return resultKeyword;
            })
            .filter((keyword) => {
                return Object.keys(keyword).length > 0;
            })
    }

    buildRevisionsSelector() {
        let {revisions, copyDraftBookRevisionAction, saveDraftBookRevisionAction, publishDraftBookRevisionAction, publishedRevision, intl, publishLoading, saveLoading, cloneLoading} = this.props;
        let {store} = this.context;
        let {activeRevision} = this.state;

        let activeRevisionHal = halson(activeRevision.source);

        let copyRevisionURI = activeRevisionHal.getLink('copyDraftRevision');
        let saveRevisionURI = activeRevisionHal.getLink('saveDraftRevision');
        let publishRevisionURI = activeRevisionHal.getLink('publishDraftRevision')

        return <ul className="revisionSelector revisionSelector-is-fixed">
            {
                revisions.map((rev) => {
                    let isSelected = activeRevisionHal._id == rev._id;

                    return <li key={rev._id}
                               className={'revisionSelector--item' + (isSelected ? ' revisionSelector--item-is-selected' : '')}
                               onClick={() => this.changeActiveRevision(rev)}>
                        <div className="revisionSelector--info">
                            <span>{rev.user.name}</span>
                            <span>{intl.formatDate(rev.created, {format: 'dateShort'})}</span>
                        </div>
                        {
                            publishedRevision == rev._id &&
                            <div>
                                <span
                                    className="revisionSelector--published">{intl.formatMessage(messages.published)}</span>
                                {
                                    rev.updated &&
                                    <span
                                        className="revisionSelector--updated"> ({intl.formatMessage(messages.changedSincePublish)})</span>
                                }
                            </div>
                        }
                        {
                            isSelected &&
                            <div className="revisionSelector--actions">
                                {
                                    copyRevisionURI &&
                                    <LoadButton className="btn btn-secondary btn-small"
                                                loading={cloneLoading}
                                                onClick={() => copyDraftBookRevisionAction(copyRevisionURI, intl)}>{intl.formatMessage(messages.clone)}</LoadButton>
                                }
                                {
                                    saveRevisionURI &&
                                    <LoadButton className="btn btn-secondary btn-small"
                                                loading={saveLoading}
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    store.dispatch(submitForm({
                                                        model: 'draftBook.bookModel',
                                                        validators: this.saveValidators
                                                    }))
                                                        .then((form) => {
                                                            let dataObj = this._formatDataObj(form);
                                                            saveDraftBookRevisionAction(dataObj, saveRevisionURI, intl)
                                                        });
                                                }}>{intl.formatMessage(masterMessages.save)}</LoadButton>
                                }
                                {
                                    publishRevisionURI &&
                                    <LoadButton className="btn btn-primary btn-small"
                                                loading={publishLoading}
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    store.dispatch(submitForm({
                                                        model: 'draftBook.bookModel',
                                                        validators: this.publishValidators
                                                    }))
                                                        .then((form) => {
                                                            let dataObj = this._formatDataObj(form);
                                                            publishDraftBookRevisionAction(dataObj, saveRevisionURI, publishRevisionURI, intl)
                                                        });
                                                }}>{intl.formatMessage(messages.publish)}</LoadButton>
                                }
                            </div>
                        }
                    </li>
                })
            }
        </ul>
    }

    hideAssociatePopup = () => {
        this.setState({
            showAssociatePopup: false
        })
    }

    showAssociatePopup = () => {
        this.setState({
            showAssociatePopup: true
        })
    }

    removeBookAssociation = () => {
        let {removeBookAssociationAction, actions, intl} = this.props;

        removeBookAssociationAction(actions.removeBookAssociation, intl);
    }

    assignDraftToUser = () => {
        let {assignDraftToUserAction, actions, intl} = this.props;

        assignDraftToUserAction(actions.assignDraftToUser, intl);
    }

    removeDraftAssignee = () => {
        let {removeAssigneeAction, actions, intl} = this.props;

        removeAssigneeAction(actions.removeDraftAssignee, intl);
    }

    onFormKeyDown = (e) => {
        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13: { //Enter
                if (e.target.type != 'textarea') {
                    e.preventDefault();
                }

                break;
            }
        }
    }

    onShowSelectCategoryPopupHandler = (e) => {
        e.preventDefault();
        let {showSelectCategoryPopupAction} = this.props;

        showSelectCategoryPopupAction();
    }

    onSelectCategoryHandler = (cat) => {
        let {store} = this.context;

        this.setState({
            category: {
                _id: cat._id,
                name: cat.name
            }
        })

        store.dispatch(setFormItem({
            model: 'draftBook.bookModel',
            prop: 'categories',
            value: cat._id,
            validators: this.publishValidators.categories
        }));
    }

    onKeywordsChangedHandler = (keywords) => {
        this.setState({
            keywords
        })
    }

    render() {
        let {
            _id, revisions, createCopy, actions, publishedRevision, publishDate, book, createdBy, assignee, history,
            intl, routeResolver, associateLoading, assignLoading, removeAssociateLoading, categoryLoading,
            initialized
        } = this.props;
        let {coverImage, file, activeRevision, showAssociatePopup, category, keywords, authors, publishers} = this.state;

        let coverImgToRender = file ? coverImage : coverBuilder.getCoverUrl(coverImage.resource);
        let activeRevisionHal = halson(activeRevision.source);
        let saveRevisionURI = activeRevisionHal.getLink('saveDraftRevision');

        return <div>
            <Helmet>
                <title>
                    {
                        intl.formatMessage(masterMessages.pageTitle, {
                            title: intl.formatMessage(messages.pageTitle)
                        })
                    }
                </title>
            </Helmet>
            {
                !initialized &&
                <PageLoader/>
            }
            {
                actions.associateDraftWithBook && showAssociatePopup &&
                <PopupFull onClose={this.hideAssociatePopup} show={showAssociatePopup}>
                    <AssociateBookContainer onAssociateBookCliked={this.hideAssociatePopup}/>
                </PopupFull>
            }
            <CategorySelectorContainer onSelectCategory={this.onSelectCategoryHandler}
                                       selectedCategoryId={category ? category._id : null}/>
            <div className="container">
                <div className="row l-bookInfo">
                    <div className="col-12 d-flex justify-content-between">
                        <div className="draftInfo">
                            <div className="draftInfo--title">
                                <div className="infoItem infoItem-noMargin">
                                    <div className="infoItem--label">{intl.formatMessage(messages.draftId)}:</div>
                                    <div className="infoItem--value">{_id}</div>
                                </div>
                                {
                                    actions.removeDraftBook &&
                                    <div className="draftInfo--remove" title={intl.formatMessage(messages.removeDraft)}
                                         onClick={this.removeDraftBook}></div>
                                }
                            </div>
                            {
                                book &&
                                <div className="draftInfo--book">
                                    <div className="infoItem infoItem-noMargin">
                                        <div className="infoItem--label">{intl.formatMessage(messages.bookId)}:</div>
                                        <div className="infoItem--value"><Link
                                            to={routeResolver.buildRouteFor('bookInfo', {
                                                place: 'all',
                                                book: book.slug
                                            })}>{book._id}</Link></div>
                                    </div>
                                </div>
                            }
                            {
                                createdBy &&
                                <div className="draftInfo--createdBy">
                                    <div className="infoItem infoItem-noMargin">
                                        <div className="infoItem--label">{intl.formatMessage(messages.createdBy)}:</div>
                                        <div className="infoItem--value"><Link
                                            to={routeResolver.buildRouteFor('userBooks', {user: createdBy.slug}, {redirect: true})}>{createdBy.name}</Link>
                                        </div>
                                    </div>
                                </div>
                            }
                            {
                                createCopy &&
                                <div className="draftInfo--createCopyFor">
                                    <div className="infoItem infoItem-noMargin">
                                        <div className="infoItem--label">{intl.formatMessage(messages.createCopyFor)}:
                                        </div>
                                        <div className="infoItem--value"><Link
                                            to={routeResolver.buildRouteFor('userBooks', {user: createCopy.user.slug}, {redirect: true})}>{createCopy.user.name}</Link>
                                        </div>
                                    </div>
                                </div>
                            }
                            {
                                (assignee || actions.assignDraftToUser) &&
                                <div className="draftInfo--assignee">
                                    {
                                        assignee &&
                                        <div className="infoItem infoItem-noMargin">
                                            <div
                                                className="infoItem--label">{intl.formatMessage(messages.draftAssignedTo)}:
                                            </div>
                                            <div className="infoItem--value"><Link
                                                to={routeResolver.buildRouteFor('userBooks', {user: assignee.slug}, {redirect: true})}>{assignee.name}</Link>
                                            </div>
                                        </div>
                                    }
                                </div>
                            }
                            {
                                publishedRevision &&
                                <div className="draftInfo--published">
                                    {intl.formatMessage(messages.published)} {publishDate && intl.formatDate(publishDate, {format: 'dateShort'})}
                                </div>
                            }
                        </div>
                        <div>
                            <LoadButton className="btn btn-link btn-small" onClick={() => {
                                history.goBack()
                            }}>&lt; {intl.formatMessage(messages.goBack)}
                            </LoadButton>
                            {
                                actions.removeBookAssociation &&
                                <LoadButton className="btn btn-secondary btn-small ml-3"
                                            loading={removeAssociateLoading}
                                            onClick={this.removeBookAssociation}>{intl.formatMessage(messages.unlinkBook)}</LoadButton>
                            }
                            {
                                actions.associateDraftWithBook &&
                                <LoadButton className="btn btn-primary btn-small ml-3"
                                            loading={associateLoading}
                                            onClick={this.showAssociatePopup}>
                                    {intl.formatMessage(messages.linkBook)}
                                </LoadButton>
                            }
                            {
                                actions.assignDraftToUser &&
                                <LoadButton className="btn btn-primary btn-small ml-3"
                                            loading={assignLoading}
                                            onClick={this.assignDraftToUser}>
                                    {intl.formatMessage(messages.assignToMe)}</LoadButton>
                            }
                            {
                                actions.removeDraftAssignee &&
                                <LoadButton className="btn btn-link btn-small"
                                            loading={assignLoading}
                                            onClick={this.removeDraftAssignee}>
                                    {intl.formatMessage(messages.unassign)}</LoadButton>
                            }
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-auto">
                        <CoverUpload
                            disabled={!saveRevisionURI}
                            onRemoveCover={this.removeCover}
                            onDropAccepted={this.onDropAccepted}
                            src={coverImgToRender}
                        />

                        <div className="form--group mt-4">
                            <div className="form--label">
                                <label>{intl.formatMessage(formMesages.popularity)}</label>
                            </div>
                            <div className="mt-2">
                                {
                                    book && book.popularity !== undefined &&
                                    <FormGroupChecked id="popularityTop"
                                                      label={`${intl.formatMessage(messages.popularityCurrent)} ${Math.round(book.popularity.total)}`}
                                                      model="draftBook.bookModel"
                                                      prop="popularity"
                                                      name="popularity"
                                                      className="form--noMargin"
                                                      disabled={!saveRevisionURI}
                                                      value="cur"
                                    />
                                }
                                <FormGroupChecked id="popularityTop"
                                                  label={intl.formatMessage(messages.popularityTop)}
                                                  model="draftBook.bookModel"
                                                  prop="popularity"
                                                  name="popularity"
                                                  className="form--noMargin"
                                                  disabled={!saveRevisionURI}
                                                  value="hgh"
                                />
                                <FormGroupChecked id="popularityTop5"
                                                  label={intl.formatMessage(messages.popularityTop5)}
                                                  model="draftBook.bookModel"
                                                  prop="popularity"
                                                  name="popularity"
                                                  className="form--noMargin"
                                                  disabled={!saveRevisionURI}
                                                  value="top"
                                />
                                <FormGroupChecked id="popularityAverage"
                                                  label={intl.formatMessage(messages.popularityAverage)}
                                                  model="draftBook.bookModel"
                                                  prop="popularity"
                                                  name="popularity"
                                                  className="form--noMargin"
                                                  disabled={!saveRevisionURI}
                                                  value="avg"
                                />
                                <FormGroupChecked id="popularityLow"
                                                  label={intl.formatMessage(messages.popularityLow)}
                                                  model="draftBook.bookModel"
                                                  prop="popularity"
                                                  name="popularity"
                                                  className="form--noMargin"
                                                  disabled={!saveRevisionURI}
                                                  value="low"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <form className="form" onKeyDown={this.onFormKeyDown}>
                            <div className="form--h">
                                <FormGroupInput id="draftBookISBN10"
                                                className="form--grow"
                                                label={intl.formatMessage(formMesages.isbn10)}
                                                placeholder={intl.formatMessage(formMesages.isbn10Placeholder)}
                                                model="draftBook.bookModel"
                                                prop="isbn10"
                                                disabled={!saveRevisionURI}
                                                messages={{
                                                    isbn10Multiple: intl.formatMessage(validationMessages.isbn10NotValid)
                                                }}/>
                                <FormGroupInput id="draftBookISBN13"
                                                className="form--grow"
                                                label={intl.formatMessage(formMesages.isbn13)}
                                                placeholder={intl.formatMessage(formMesages.isbn13Placeholder)}
                                                model="draftBook.bookModel"
                                                prop="isbn13"
                                                disabled={!saveRevisionURI}
                                                messages={{
                                                    isbn13Multiple: intl.formatMessage(validationMessages.isbn13NotValid)
                                                }}/>
                            </div>
                            <FormGroupInput id="draftBookTitle"
                                            label={intl.formatMessage(formMesages.bookTitle)}
                                            placeholder={intl.formatMessage(formMesages.bookTitlePlaceholder)}
                                            model="draftBook.bookModel"
                                            prop="title"
                                            disabled={!saveRevisionURI}
                                            messages={{
                                                required: intl.formatMessage(validationMessages.titleRequired)
                                            }}/>

                            <div className="form--group">
                                <div className="form--label">
                                    <label>{intl.formatMessage(formMesages.author)}</label>
                                </div>
                                <div className="form--content">
                                    <AuthorsSelector
                                        disabled={!saveRevisionURI}
                                        revisionId={activeRevision.source ? activeRevision.source._id : null}
                                        authors={authors}
                                    />
                                </div>
                            </div>
                            <div className="form--group">
                                <div className="form--label">
                                    <label>{intl.formatMessage(formMesages.publisher)}</label>
                                </div>
                                <div className="form--content">
                                    <PublishersSelector
                                        disabled={!saveRevisionURI}
                                        revisionId={activeRevision.source ? activeRevision.source._id : null}
                                        publishers={publishers}
                                    />
                                </div>
                                <Error
                                    model="draftBook.bookModel"
                                    prop="publishers"
                                    className="form--errors"
                                    messages={{
                                        required: intl.formatMessage(validationMessages.publisherRequired)
                                    }}/>
                            </div>

                            <FormGroupInput id="draftBookPublishDate"
                                            label={intl.formatMessage(formMesages.publishDate)}
                                            placeholder={intl.formatMessage(formMesages.publishDatePlaceholder)}
                                            model="draftBook.bookModel"
                                            prop="publishDate"
                                            disabled={!saveRevisionURI}
                                            messages={{
                                                required: intl.formatMessage(validationMessages.publishYearRequired),
                                                year: intl.formatMessage(validationMessages.publishYearNotValid)
                                            }}/>
                            <div className="form--group">
                                <div className="form--label"><label>{intl.formatMessage(formMesages.category)}</label>
                                </div>
                                <div className="form--content">
                                    <div className={`buttonSelector ${!category ? 'buttonSelector-is-empty' : ''}`}>
                                        <div className="buttonSelector--item">
                                            {category ? category.name : intl.formatMessage(messages.noCategoryAssigned)}
                                        </div>
                                        {
                                            saveRevisionURI &&
                                            <div className="buttonSelector--action">
                                                <LoadButton className="btn btn-small btn-secondary"
                                                            loading={categoryLoading}
                                                            onClick={this.onShowSelectCategoryPopupHandler}>{intl.formatMessage(messages.selectCategory)}</LoadButton>
                                            </div>

                                        }
                                    </div>
                                </div>
                                <Error
                                    model="draftBook.bookModel"
                                    prop="categories"
                                    className="form--errors"
                                    messages={{
                                        required: intl.formatMessage(validationMessages.categoryRequired)
                                    }}/>
                            </div>
                            <div className="form--h">
                                <FormGroupInput id="draftBookLanguageCode"
                                                className="form--grow"
                                                label={intl.formatMessage(formMesages.languageCode)}
                                                placeholder={intl.formatMessage(formMesages.languageCodePlaceholder)}
                                                model="draftBook.bookModel"
                                                prop="languages"
                                                disabled={!saveRevisionURI}
                                                messages={{
                                                    required: intl.formatMessage(validationMessages.languageCodeRequired)
                                                }}/>
                                <FormGroupInput id="draftBookPages"
                                                className="form--grow"
                                                label={intl.formatMessage(formMesages.numberOfPages)}
                                                model="draftBook.bookModel"
                                                prop="pages"
                                                disabled={!saveRevisionURI}
                                                messages={{
                                                    required: intl.formatMessage(validationMessages.pagesCountRequired)
                                                }}/>
                            </div>
                            <FormGroupInput id="draftBookBindings"
                                            label={intl.formatMessage(formMesages.bookFormat)}
                                            placeholder={intl.formatMessage(formMesages.bookFormatPlaceholder)}
                                            model="draftBook.bookModel"
                                            prop="bindings"
                                            disabled={!saveRevisionURI}
                                            messages={{
                                                required: intl.formatMessage(validationMessages.formatRequired)
                                            }}/>

                            <div className="form--group">
                                <div className="form--label">
                                    <label>{intl.formatMessage(formMesages.bookSubjects)}</label>
                                </div>
                                <div className="form--content">
                                    <KeywordsSelector keywords={keywords}
                                                      onKeywordsChanged={this.onKeywordsChangedHandler}
                                                      disabled={!saveRevisionURI}/>
                                </div>
                            </div>

                            <FormGroupInput id="draftBookDescription"
                                            label={intl.formatMessage(formMesages.bookDescription)}
                                            placeholder={intl.formatMessage(formMesages.bookDescriptionPlaceholder)}
                                            model="draftBook.bookModel"
                                            prop="description"
                                            type="textarea"
                                            disabled={!saveRevisionURI}
                                            messages={{
                                                limit: intl.formatMessage(validationMessages.descriptionLimit)
                                            }}/>

                        </form>
                    </div>
                    <div className="col-4">
                        {
                            revisions.length > 0 && this.buildRevisionsSelector()
                        }
                    </div>
                </div>
            </div>
        </div>
    }
}

const messages = defineMessages({
    pageTitle: {
        id: 'draftBook.pageTitle',
        defaultMessage: 'Book draft'
    },
    published: {
        id: 'draftBook.published',
        defaultMessage: 'Published'
    },
    publish: {
        id: 'draftBook.publish',
        defaultMessage: 'Publish'
    },
    changedSincePublish: {
        id: 'draftBook.changedSincePublish',
        defaultMessage: 'Changed since last publish'
    },
    clone: {
        id: 'draftBook.clone',
        defaultMessage: 'Clone'
    },
    draftId: {
        id: 'draftBook.draftId',
        defaultMessage: 'Draft id'
    },
    removeDraft: {
        id: 'draftBook.removeDraft',
        defaultMessage: 'Remove draft'
    },
    bookId: {
        id: 'draftBook.bookId',
        defaultMessage: 'Book id'
    },
    createdBy: {
        id: 'draftBook.createdBy',
        defaultMessage: 'Created by'
    },
    createCopyFor: {
        id: 'draftBook.createCopyFor',
        defaultMessage: 'Create copy for'
    },
    draftAssignedTo: {
        id: 'draftBook.draftAssignedTo',
        defaultMessage: 'Draft assigned to'
    },
    goBack: {
        id: 'draftBook.goBack',
        defaultMessage: 'Go Back'
    },
    unlinkBook: {
        id: 'draftBook.unlinkBook',
        defaultMessage: 'Unlink book'
    },
    linkBook: {
        id: 'draftBook.linkBook',
        defaultMessage: 'Link book'
    },
    assignToMe: {
        id: 'draftBook.assignToMe',
        defaultMessage: 'Assign to me'
    },
    unassign: {
        id: 'draftBook.unassign',
        defaultMessage: 'Unassign'
    },
    selectCategory: {
        id: 'draftBook.selectCategory',
        defaultMessage: 'Select category'
    },
    noCategoryAssigned: {
        id: 'draftBook.noCategoryAssigned',
        defaultMessage: 'No category is assigned to book'
    },
    popularityCurrent: {
        id: 'draftBook.popularityCurrent',
        defaultMessage: 'Current'
    },
    popularityTop: {
        id: 'draftBook.popularityTop',
        defaultMessage: 'Highest'
    },
    popularityTop5: {
        id: 'draftBook.popularityTop5',
        defaultMessage: 'Top 5'
    },
    popularityAverage: {
        id: 'draftBook.popularityAverage',
        defaultMessage: 'Average'
    },
    popularityLow: {
        id: 'draftBook.popularityLow',
        defaultMessage: 'Lowest'
    }
})

const mapStateToProps = (state, props) => {
    return {
        _id: state.draftBook.draft._id,
        initialized: state.draftBook.general.initialized,
        createCopy: state.draftBook.draft.createCopy,
        book: state.draftBook.draft.book,
        createdBy: state.draftBook.draft.createdBy,
        assignee: state.draftBook.draft.assignee,
        revisions: state.draftBook.draft.revisions,
        actions: state.draftBook.general.actions,
        publishedRevision: state.draftBook.draft.publishedRevision,
        publishDate: state.draftBook.draft.publishDate,
        associateLoading: state.draftBook.draft.associateLoading,
        removeAssociateLoading: state.draftBook.draft.removeAssociateLoading,
        assignLoading: state.draftBook.draft.assignLoading,
        saveLoading: state.draftBook.draft.saveLoading,
        publishLoading: state.draftBook.draft.publishLoading,
        cloneLoading: state.draftBook.draft.cloneLoading,
        categoryLoading: state.draftBook.draft.categoryLoading,
    }
}

const mapDispatchToProps = {
    removeDraftBookAction,
    searchBookAction,
    copyDraftBookRevisionAction,
    saveDraftBookRevisionAction,
    publishDraftBookRevisionAction,
    removeBookAssociationAction,
    assignDraftToUserAction,
    removeAssigneeAction,
    resetFormsAction,
    showCreateEditPublisherPopupAction,
    showSelectCategoryPopupAction,
    setDraftBookInitializedAction
}

const loadData = (props, context) => {
    let draftBookId = DraftBookContainer.getBook(props.match);

    return context.store.dispatch(loadDraftBookAction({draftBookId}));
}

export default withComponentExtended('draftBook', [], loadData)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(DraftBookContainer)));