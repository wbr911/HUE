goog.provide('com.worksap.bootcamp.webeditor.Application');
goog.require('com.worksap.bootcamp.webeditor.component.ArticleList');
goog.require('com.worksap.bootcamp.webeditor.component.ArticleEditor');
goog.require('com.worksap.bootcamp.webeditor.dao.ArticleDao');
goog.require('com.worksap.bootcamp.webeditor.validator.Validator');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.ui.Component');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarButton');

/**
 * Web Editor Application (controller)
 * @constructor
 */
com.worksap.bootcamp.webeditor.Application = function (articleDao, validator) {

    this.daos_ = {
        articleDao: articleDao
    };
    this.validators_ = {

        validator: validator
    };
    this.components_ = this.buildComponents(
        goog.dom.getElement('toolbar'),
        goog.dom.getElement('article-list-ul'),
        goog.dom.getElement('editor')
    );
    this.bindEvents(this.components_);

    // TODO: implement method if needed

    /**
     * Short cut keys which should be handled
     */
    this.shortcutKeys_ = [
        {ctrl: true, alt: false, shift: false, key: goog.events.KeyCodes.S, event: this.onSaveButtonAction_},
        {ctrl: true, alt: false, shift: false, key: goog.events.KeyCodes.INSERT, event: this.onNewButtonAction_},
        {ctrl: true, alt: false, shift: false, key: goog.events.KeyCodes.DELETE, event: this.onDeleteButtonAction_},
        {
            ctrl: true, alt: false, shift: false, key: goog.events.KeyCodes.Q, event: function (event) {
            alert('[Ctrl+Q] OK');
        }
        } // for debugging
    ];
};

(function (Application) {
    /**
     *
     * @param {Element} $toolbar
     * @param {Element} $listUl
     * @param {Element} $editor
     * @returns {{
   *   toolbar: Element,
   *   list: com.worksap.bootcamp.webeditor.component.ArticleList,
   *   editor: com.worksap.bootcamp.webeditor.component.ArticleEditor
   * }}
     */
    Application.prototype.buildComponents = function ($toolbar, $listUl, $editor) {
        var editor = new com.worksap.bootcamp.webeditor.component.ArticleEditor();
        editor.decorate($editor);
        var articleList = new com.worksap.bootcamp.webeditor.component.ArticleList();
        articleList.decorate($listUl);
        return {
            toolbar: $toolbar,
            list: articleList,
            editor: editor
        }
    };

    /**
     *
     * @param {{
   *   toolbar: goog.ui.Toolbar,
   *   buttons: Object.<string, goog.ui.ToolbarButton>,
   *   list: com.worksap.bootcamp.webeditor.component.ArticleList,
   *   editor: com.worksap.bootcamp.webeditor.component.ArticleEditor
   * }} components
     */
    Application.prototype.bindEvents = function (components) {
        goog.events.listen(components.editor, com.worksap.bootcamp.webeditor.component.ArticleEditor.EventType.VALIDATE_TITLE, this.onValidateTitle_, false, this);
        goog.events.listen(components.toolbar, goog.events.EventType.CLICK, this.onToolbarButtonClick_, false, this);
        goog.events.listen(components.list, com.worksap.bootcamp.webeditor.component.ArticleList.EventType.BEFORE_CHANGE, this.onListChanging_, false, this);
        goog.events.listen(components.list, com.worksap.bootcamp.webeditor.component.ArticleList.EventType.CHANGE, this.onListChange_, false, this);
        goog.events.listen(document, goog.events.EventType.KEYDOWN,this.onKeyDown_,false,this);
        this.fillData(components);
    };
    /**
     *
     * @param {{
   *   toolbar: goog.ui.Toolbar,
   *   buttons: Object.<string, goog.ui.ToolbarButton>,
   *   list: com.worksap.bootcamp.webeditor.component.ArticleList,
   *   editor: com.worksap.bootcamp.webeditor.component.ArticleEditor
   * }} components
     * @private
     */
    Application.prototype.fillData = function (components) {
        this.daos_.articleDao.findAllArticles(function (articles) {
            if(!articles || articles.length==0){
                components.editor.disable();
            }else {
                components.list.init(articles);
            }
        });


    }
    /**
     * Event handler dispatched before the article list is changed.
     * @param {com.worksap.bootcamp.webeditor.component.BeforeListChangeEvent} event
     * @private
     */
    Application.prototype.onListChanging_ = function (event) {
        if (this.components_.editor.isModified()) {
            if (confirm('Article is changed .Discard changes?')) {
                this.components_.list.setSelectedIndex(event.newIndex);
                this.components_.editor.setModified(false);
            }
        } else {
            this.components_.list.setSelectedIndex(event.newIndex);
            this.components_.editor.setModified(false);
        }
    };

    /**
     * Event handler dispatched after the article list is changed.
     * @param {com.worksap.bootcamp.webeditor.component.ListChangeEvent} event
     * @private
     */
    Application.prototype.onListChange_ = function (event) {
        var newItem = this.components_.list.getItem(event.newIndex);
        if (newItem) {
            this.components_.editor.enable();
            this.components_.editor.setArticle(newItem.data.title, newItem.data.content);
        } else {
            this.components_.editor.disable();
            this.components_.editor.setArticle('', '');
        }
    };

    /**
     * Event handler dispatched after the article editor is changed.
     * @param {goog.events.BrowserEvent} event
     * @private
     */
    Application.prototype.onEditorChange_ = function (event) {
        // TODO: implement method
    };

    /**
     * Refresh save and delete buttons status
     * @private
     */
    Application.prototype.refreshButtonStatus_ = function () {
        // TODO: implement method if needed (or delete this method)
    };

    /**
     * Event handler dispatched on the toolbar buttons are clicked
     * @param {goog.events.Event} event
     * @private
     */
    Application.prototype.onToolbarButtonClick_ = function (event) {
        switch (event.target.getAttribute('id')) {
            case 'save-button':
                this.onSaveButtonAction_(event);
                break;
            case 'new-button':
                this.onNewButtonAction_(event);
                break;
            case 'delete-button':
                this.onDeleteButtonAction_(event);
                break;
        }
    };

    /**
     * Individual event handler dispatched on the new button is clicked (or Ctrl+INS is pressed)
     * @param {goog.events.Event} event
     * @private
     */
    Application.prototype.onNewButtonAction_ = function (event) {
        var dao = this.daos_.articleDao;
        var list = this.components_.list;
        dao.findTitles(function (titles) {
            var len = titles.length;
            var untitleIndex = 0;
            var isUnique = true;
            // find the available untitled postfix
            while (true) {
                untitleIndex++;
                for (var i = 0; i < len; i++) {
                    if (titles[i] == 'untitled-' + untitleIndex) {
                        isUnique = false;
                        break;
                    }
                }
                if (isUnique) {
                    break;
                } else {
                    isUnique = true;
                }
            }
            var article = {
                'title': 'untitled-' + untitleIndex,
                'content': ''
            }
            dao.create(article, function (created) {
                var newItem = list.addItem(created.title, created, true);

            });
        });

    };


    /**
     * Individual event handler dispatched on the save button is clicked (or Ctrl+S is pressed)
     * @param {goog.events.Event} event
     * @private
     */
    Application.prototype.onSaveButtonAction_ = function (event) {
        var list = this.components_.list;

        var selectedItem = list.getItem(list.getSelectedIndex());
        var article = {
            'id': selectedItem.data.id,
            'title': this.components_.editor.getTitle(),
            'content': this.components_.editor.getContent()
        };
        this.daos_.articleDao.update(article);
        selectedItem.data.title = article.title;
        selectedItem.data.content = article.content;
        list.setItem(list.getSelectedIndex(), article.title, selectedItem.data);
        this.components_.editor.setModified(false);
    };

    /**
     * Individual event handler dispatched on the save button is clicked (or Ctrl+DEL is pressed)
     * @param {goog.events.Event} event
     * @private
     */
    Application.prototype.onDeleteButtonAction_ = function (event) {
        if(!confirm('sure to delete?')){
            return;
        }
        var selectedIndex = this.components_.list.getSelectedIndex();
        this.daos_.articleDao.deleteById(this.components_.list.getItem(selectedIndex).data.id);
        this.components_.list.removeItem(selectedIndex);
        this.components_.editor.setModified(false);
        this.components_.list.setSelectedIndex(selectedIndex - 1);
    };

    /**
     * Event handler dispatched on the title validation
     * @param {com.worksap.bootcamp.webeditor.component.TitleValidateEvent} event
     * @private
     */
    Application.prototype.onValidateTitle_ = function (event) {
        var editor = this.components_.editor;
        var toolbar = this.components_.toolbar;
        editor.setTitleValidationStatus(com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.VALIDATING);
        var selectedIndex = this.components_.list.getSelectedIndex();
        var titleId = this.components_.list.getItem(selectedIndex).data.id;
        this.validators_.validator.validateTitle(titleId, event.title, function (res, msg) {
            if (res) {
                editor.setTitleValidationStatus(com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.VALID);
                goog.dom.getElement('save-button').classList.remove('goog-toolbar-button-disabled');
            }
            else {
                editor.setTitleValidationStatus(com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.INVALID, msg);
                goog.dom.getElement('save-button').classList.add('goog-toolbar-button-disabled');
            }
        });
    };

    /**
     * Event handler dispatched on keys pressed
     * @param {goog.events.KeyEvent} event
     * @private
     */
    Application.prototype.onKeyDown_ = function (event) {
        var len = this.shortcutKeys_.length;
        for(var i = 0 ; i< len ;i++){
            var rule =this.shortcutKeys_[i];
            if(rule.alt ==event.altKey &&
               rule.ctrl == event.ctrlKey&&
               rule.shift == event.shiftKey&&
               rule.key == event.keyCode){
                // such as ctrl s
                event.preventDefault();
                rule.event.call(this,event);
            }
        }
    };
})(com.worksap.bootcamp.webeditor.Application);

