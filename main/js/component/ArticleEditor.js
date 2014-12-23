goog.provide('com.worksap.bootcamp.webeditor.component.ArticleEditor');
goog.provide('com.worksap.bootcamp.webeditor.component.TitleValidatingEvent');
goog.provide('com.worksap.bootcamp.webeditor.component.TitleValidateEvent');

goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.events.Event');
goog.require('com.worksap.bootcamp.webeditor.validator.Validator');
/**
 * An editor component for Web Text Editor.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
com.worksap.bootcamp.webeditor.component.ArticleEditor = function (opt_domHelper) {
    // super()
    goog.ui.Component.call(this, opt_domHelper);
    this.modifiedFlag = false;

};
// inherit
goog.inherits(com.worksap.bootcamp.webeditor.component.ArticleEditor, goog.ui.Component);

com.worksap.bootcamp.webeditor.component.ArticleEditor.EventType = {
    VALIDATE_TITLE: goog.events.getUniqueId('validate_title')
};
(function (ArticleEditor) {
    /**
     * @enum
     */
    // errors: id generator call must be in the global scope
    // ArticleEditor.EventType = {
    //   VALIDATE_TITLE: goog.events.getUniqueId('validate_title')
    // };

    /**
     * @enum {string}
     */
    ArticleEditor.ValidationStatus = {
        VALID: 'valid',
        VALIDATING: 'validating',
        INVALID: 'invalid'
    };

    /**
     * @override
     */
    ArticleEditor.prototype.canDecorate = function ($element) {
        var domHelper = this.getDomHelper();
        return (
        domHelper.getElementsByTagNameAndClass('input', 'article-title', $element)[0] &&
        domHelper.getElementsByClass('article-title-error-messages')[0] &&
        domHelper.getElementsByTagNameAndClass('textarea', 'article-content', $element)[0]
        );
    };

    /**
     * @override
     */
    ArticleEditor.prototype.decorateInternal = function ($element) {
        this.title = goog.dom.getElement('editor-title');
        this.content = goog.dom.getElement('editor-content');
        this.errorMsg = goog.dom.getElement('editor-content');
    };

    /**
     * @override
     */
    ArticleEditor.prototype.enterDocument = function () {
        var handler = this.getHandler();
        handler.listen(this.title, goog.events.EventType.INPUT, this.onTitleInput_);
        handler.listen(this.content, goog.events.EventType.INPUT, this.onContentInput_);
    };

    /**
     * Event handler dispatched on the editor title (&lt;input&gt; element) is changed
     * @param {goog.events.BrowserEvent} event
     * @private
     */
    ArticleEditor.prototype.onTitleInput_ = function (event) {
        // problem: it doesn't make sense when you add a letter and then delete the letter
        this.setModified(true);
        this.dispatchEvent(new com.worksap.bootcamp.webeditor.component.TitleValidateEvent(this.getTitle()));
    };

    /**
     * Event handler dispatched on the editor content (&lt;textarea&gt; element) is changed.
     * @param {goog.events.BrowserEvent} event
     * @private
     */
    ArticleEditor.prototype.onContentInput_ = function (event) {
        this.setModified(true);
    };

    /**
     * Dispatch a component event for change (title and component).
     * Event type: {goog.events.BrowserEvent} with goog.events.EventType.INPUT
     * @param {goog.events.BrowserEvent} event with goog.events.EventType.INPUT
     * @private
     */
    ArticleEditor.prototype.dispatchOnInputEvent_ = function (event) {
        /*
         * NOTE: In this code, event type of the capsulated is inherited goog.events.EventType.INPUT.
         * You may change to goog.events.EventType.CHANGE or a unique event type.
         * (if you do so, change the method name and JSDoc comment properly)
         */
        var capsulated = new goog.events.BrowserEvent(event.getBrowserEvent(), this);
        this.dispatchEvent(capsulated);
    };

    /**
     * @override
     */
    ArticleEditor.prototype.disposeInternal = function () {
        // TODO: implement method
    };

    /**
     * Set the article title and content.
     * @param {string} title
     * @param {string} content
     */
    ArticleEditor.prototype.setArticle = function (title, content) {
        this.title.value = title;
        this.content.value = content;
    };

    /**
     * Update validation status of the component.<br />
     * When validation started, the status is set to VALIDATING.
     * This method should be called when validation finished to update the status VALID/INVALID.
     * @param {com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus} status
     * @param {string=} message
     */
    ArticleEditor.prototype.setTitleValidationStatus = function (status, message) {
        this.title.classList.remove('invalid');
        this.title.classList.remove('validating');
        switch (status) {
            case ArticleEditor.ValidationStatus.VALID:
                this.errorMsg.innerText = '';
                break;
            case ArticleEditor.ValidationStatus.INVALID:
                this.title.classList.add('invalid');
                this.errorMsg.innerText = message;
                break;
            case ArticleEditor.ValidationStatus.VALIDATING:
                this.title.classList.add('validating');
                this.errorMsg.innerText = 'validating';
                break;


        }
    };

    /**
     * Whether the component is enabled
     * @returns {boolean}
     */
    ArticleEditor.prototype.isEnabled = function () {
        // TODO: implement method
    };

    /**
     * Set whether the component is enabled
     * @param {boolean} enabled
     */
    ArticleEditor.prototype.setEnabled = function (enabled) {
        // TODO: implement method
    };

    /**
     * Whether the title or the content of the component is modified
     * @returns {boolean}
     */
    ArticleEditor.prototype.isModified = function () {
        return this.modifiedFlag;
    };

    /**
     * Set whether the title or the content of the component is modified
     * @param {boolean} modified
     */
    ArticleEditor.prototype.setModified = function (modified) {
        this.modifiedFlag = modified;
    };

    /**
     * Whether the title input in the component is valid
     * @returns {boolean}
     */
    ArticleEditor.prototype.isTitleValid = function () {
        //
    };

    /**
     * the title input in the component
     * @returns {string}
     */
    ArticleEditor.prototype.getTitle = function () {
        return this.title.value;
    };

    /**
     * the content input in the component
     * @returns {string}
     */
    ArticleEditor.prototype.getContent = function () {
        return this.content.value;
    };
    com.worksap.bootcamp.webeditor.component.ArticleEditor.prototype.disable = function () {
        this.title.setAttribute('disabled', 'true');
        this.content.setAttribute('disabled', 'true');
    }
    com.worksap.bootcamp.webeditor.component.ArticleEditor.prototype.enable = function(){
        this.title.removeAttribute('disabled');
        this.content.removeAttribute('disabled');
    }


})(com.worksap.bootcamp.webeditor.component.ArticleEditor);

/**
 *
 * @param {string} title
 * @constructor
 * @extends {goog.events.Event}
 */
com.worksap.bootcamp.webeditor.component.TitleValidateEvent = function (title) {
    goog.events.Event.call(this, com.worksap.bootcamp.webeditor.component.ArticleEditor.EventType.VALIDATE_TITLE);
    this.title = title;
};

