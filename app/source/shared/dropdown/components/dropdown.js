import React from 'react'


class DropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpened: false,
            selectedItem: null
        };
    }


    componentWillReceiveProps(nextProps) {
        this.updateSelectedItem(nextProps)
    }

    componentWillMount() {
        this.updateSelectedItem(this.props)
    }

    updateSelectedItem(props) {
        let {children} = props;
        let selectedItem = null;

        React.Children.forEach(children, (child) => {
            if (child.props.isSelected) {
                selectedItem = child;
            }
        })

        /*if (!selectedItem)
            return;*/

        this.setState({
            selectedItem: selectedItem ? selectedItem.props : null
        })
    }

    componentDidMount() {
        window.addEventListener('click', this.onWindowClick);
        window.addEventListener('touchend', this.onWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onWindowClick);
        window.removeEventListener('touchend', this.onWindowClick);
    }

    onWindowClick = (e) => {
        if (this.state.isOpened === true) {
            var source = e.target;
            var found = false;

            // if source=dropdown elemnt then this event came from "somewhere" inside and should be ignored.
            while (source.parentNode) {
                found = (source === this.refs.dropdown);

                if (found) return;

                source = source.parentNode;
            }

            // not found: genuine outside event. Handle it.
            this.setState({
                isOpened: false
            })
        }
    }

    onSelectedValueChanged(data) {
        let {onSelectedValueChanged} = this.props;

        let valueExistsAndNotChanged = (!!this.state.selectedItem && this.state.selectedItem.value === data.value)

        if (valueExistsAndNotChanged)
        {
            this.setState({
                isOpened: false
            })
            return;
        }

        this.setState({
            selectedItem: data,
            isOpened: false
        })

        if (!!onSelectedValueChanged) {
            onSelectedValueChanged(data.value);
        }
    }

    onToogleClick() {
        let {disabled} = this.props;
        if (!!disabled)
            return;

        this.setState({
            isOpened: !this.state.isOpened
        })
    }

    getToggleElementText() {
        let {title} = this.props
        const selectedItem = this.state.selectedItem;


        if (!!selectedItem) {
            title = selectedItem.text;
        }

        return title;
    }

    getPopupElement() {
        let {type, children} = this.props;
        let element;
        switch (type) {
            case 'custom': {
                let tempOnClick;
                if (children.props.onClick)
                {
                    tempOnClick = children.props.onClick;
                }

                element = React.cloneElement(children, {
                    onClick: (e) => {
                        this.setState({
                            isOpened: false
                        })
                        tempOnClick && tempOnClick(e);
                    }
                });
                break;
            }
            default: {
                element =
                    (<ul>
                        {
                            React.Children.map(children, (child) => {
                                let props = {
                                    onClick: () => {
                                        this.onSelectedValueChanged(child.props);
                                    },
                                    isSelected: !!this.state.selectedItem && (this.state.selectedItem.value === child.props.value)
                                }

                                return React.cloneElement(child, props);
                            })
                        }
                    </ul>)

            }
        }

        return element;
    }

    render() {
        let {togglePrefixText, togglePrefixClassNames, disabled, className, selectedCount} = this.props;
        let toggleElementPrefix;
        if (togglePrefixText) {
            toggleElementPrefix = <span className={togglePrefixClassNames}>{togglePrefixText}</span>;
        }

        if (!className)
            className = '';

        className += ' dropdown';

        if (this.state.isOpened) {
            className += ' dropdown-is-opened';
        }

        if (!!disabled) {
            className += ' dropdown-is-disabled';
        }

        return (
            <div className={className} ref="dropdown">
                <div className="dropdown--toggle" onClick={(e) => this.onToogleClick(e)}>
                    {toggleElementPrefix}
                    <span className="dropdown--toggleText"
                          title={this.getToggleElementText()}>{this.getToggleElementText()}</span>
                    {
                        !!selectedCount &&
                            <span className="dropdown--selectedCount">{selectedCount}</span>
                    }
                    <span>
                        <span className="dropdown--arrow"></span>
                    </span>
                </div>
                <div className="dropdown--menu">
                    {this.getPopupElement()}
                </div>
            </div>
        );
    }
}

export default DropDown

