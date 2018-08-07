/**
 * Created by Mike on 9/1/2017.
 */

import React from 'react';
import {Link} from 'react-router-dom';

class AuthorsList extends React.Component {

    onAuthorClick = (e, author) => {
        let {onAuthorClick} = this.props;

        e.preventDefault();
        onAuthorClick(author);
    }

    render() {
        let {authors, authorUrlTemplateBuilder, pushState, labels, className} = this.props;

        return authors && <div className={`authorsList ${className ? className : ''}`} title={authors.map(a => a.name).join(', ')}>{authors.map((author, idx) => {
            if (!labels){
                if (pushState){
                    return <Link key={author._id} to={authorUrlTemplateBuilder ? authorUrlTemplateBuilder(author) : '#'}>{idx > 0 ? ', ' : ' '}{author.name}</Link>
                }else{
                    return <a key={author._id} href={authorUrlTemplateBuilder ? authorUrlTemplateBuilder(author): '#'}
                              onClick={(e) => {
                                  this.onAuthorClick(e, author)
                              }}>{idx > 0 ? ', ' : ' '}{author.name}</a>
                }
            }else{
                return <span key={author._id}>{idx > 0 ? ', ' : ' '}{author.name}</span>
            }

            })}</div>
    }
}

export default AuthorsList;