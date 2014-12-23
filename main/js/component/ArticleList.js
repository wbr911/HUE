goog.provide('com.worksap.bootcamp.webeditor.component.ArticleList');

goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.ui.Component');
goog.require('goog.array');
goog.require('goog.events.Event');

/**
 * A list component for Web Text Editor.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
com.worksap.bootcamp.webeditor.component.ArticleList = function (opt_domHelper) {
    goog.ui.Component.call(this, opt_domHelper);
    this.list = new Array();
    this.selectedIndex = -1;

};
goog.inherits(com.worksap.bootcamp.webeditor.component.ArticleList, goog.ui.Component);
com.worksap.bootcamp.webeditor.component.ArticleList.elementIDprefix = 'article-list-ul-item-';
/**
 * @enum {string}
 */
com.worksap.bootcamp.webeditor.component.ArticleList.EventType = {
    /** dispatched before the selected item is changed. */
    BEFORE_CHANGE: goog.events.getUniqueId('before-change'),
    /** dispatched after the selected item is changed. */
    CHANGE: goog.events.getUniqueId('change')
};

/**
 * @override
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.canDecorate = function ($element) {
    if($element.tagName === 'UL' && $element.id){
        return true;
    }else{
        return false;
    }

};

/**
 * Regex of normalized (non-zero-filled) natural number (contains 0) for utility.
 * @type {RegExp}
 * @private
 */
com.worksap.bootcamp.webeditor.component.ArticleList.NORMALIZED_NUMBERS_ = /^([1-9]\d*|0)$/;

/**
 * @override
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.decorateInternal = function ($element) {
    this.root = $element;

};
/**
 * @param {Array.<{id: number, title: string, content: string}>} datas.
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.init = function (datas) {

    var isFirst = true;
    for (var id in datas) {
        if (!datas.hasOwnProperty(id)) {
            continue;
        }
        this.addItem(datas[id].title, datas[id], isFirst);
        if (isFirst) {
            isFirst = false;
        }
    }
}
/**
 * Add a new item to the list component.
 * @param {string} text displayed title (no html-escape needed)
 * @param {?Object} data data associated to the list item (for util).
 * @param {boolean} selected whether the item will be selected (if it can be)
 * @returns {Object.<{index: number, elementId: string, text: string, data: ?*}>}
 *   information of the registered item.
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.addItem = function (text, data, selected) {
    // TODO: implement method
    var itemData = {
        index: this.list.length,
        elementId: com.worksap.bootcamp.webeditor.component.ArticleList.elementIDprefix + this.list.length,
        text: data.title,
        data: data
    };
    this.list.push(itemData);
    this.root.appendChild(goog.dom.createDom('li', {'id': itemData.elementId, 'innerText': itemData.text}));
    if (selected) {
        this.changeSelectedItem(itemData.index);
    }
    return goog.object.clone(itemData);
};

/**
 * Set (update) the item of the list component.
 * @param {number} index
 * @param {string} text displayed title (no html-escape needed)
 * @param {?Object} data data associated to the list item (for util).
 * @returns {Object.<{index: number, elementId: string, text: string, data: ?*}>}
 *   information of the registered item.
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.setItem = function (index, text, data) {
    // TODO: implement method
    var item = this.getItem(index);
    item.text = text;
    item.data = data;
    return goog.object.clone(item);
};

/**
 * Find the item with the index.
 * @param {number} index
 * @returns {{index: number, elementId: string, text: string, data: ?*}|undefined}
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.getItem = function (index) {
    if (index >= 0) {
        return this.list[index];
    }
};

/**
 * Find the n-th child of the list.
 * @param {number} n
 * @returns {{index: number, elementId: string, text: string, data: ?*}|undefined}
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.getNthItem = function (n) {
    return goog.dom.getChildren(this.root)[n];
};

/**
 * @param {number} index
 * @returns {boolean} true if the item is removed successfully, false if the no item to be removed is found.
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.removeItem = function (index) {
    var target = goog.dom.getElement(com.worksap.bootcamp.webeditor.component.ArticleList.elementIDprefix + index);
    if(!target){
        return false;
    }else{
        target.remove();
        delete this.list[index];
        return true;
    }


};

/**
 * The index of the selected item.
 * @returns {number} 0 or positive numbers the index of the selected item, -1 if the no item is selected.
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.getSelectedIndex = function () {
    return this.selectedIndex;
};

/**
 * Set the index of the selected item.
 * If the selected index is changed, two events -
 * a com.worksap.bootcamp.webeditor.component.BeforeListChangeEvent and
 * a succeeding com.worksap.bootcamp.webeditor.component.ListChangeEvent are raised.
 * Invalid index will result in no effect.
 * @param {number} newIndex
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.setSelectedIndex = function (newIndex) {
    if (this.selectedIndex == newIndex) {
        return;
    }
    // to find the nearest item above newIndex if list[newIndex] has already been deleted
    var selectedItem = this.list[newIndex];
    if (!selectedItem) {
        while (!selectedItem && newIndex >= 0) {
            selectedItem = this.list[newIndex--];
        }
        newIndex++;
        if (newIndex == 0) {
            this.dispatchEvent(new com.worksap.bootcamp.webeditor.component.ListChangeEvent(this.selectedIndex, -1));
            return;
        }
    }
    if (!selectedItem) {
        return;
    }
    var oldItem = goog.dom.findNode(this.root,function(node){if(node instanceof HTMLElement && node.getAttribute('class')=='active'){return true} return false});
    if (oldItem) {
        oldItem.classList.remove('active');
    }
    goog.dom.getElement(this.list[newIndex].elementId).setAttribute('class','active');
    var oldIndex = this.selectedIndex;
    this.selectedIndex = newIndex;
    this.dispatchEvent(new com.worksap.bootcamp.webeditor.component.ListChangeEvent(oldIndex, newIndex));
};

/**
 * @override
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.enterDocument = function () {
    var handler = this.getHandler();
    handler.listen(this.root, goog.events.EventType.CLICK, this.onListClick_);
};

/**
 * The event handler of click at the list component.
 * @param {goog.events.Event} event
 * @private
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.onListClick_ = function (event) {
    var id = event.target.getAttribute('id');
    var newIndex = Number(id.replace(com.worksap.bootcamp.webeditor.component.ArticleList.elementIDprefix, ''));
    if (newIndex == this.selectedIndex) {
        return;
    }
    this.dispatchEvent(new com.worksap.bootcamp.webeditor.component.BeforeListChangeEvent(this.selectedIndex, newIndex, true));

};
/**
 *
 * @param {number} newIndex index of the item
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.changeSelectedItem = function (newIndex) {
    goog.dom.getElement( this.list[newIndex].elementId).click();
}
/**
 * @override
 */
com.worksap.bootcamp.webeditor.component.ArticleList.prototype.disposeInternal = function () {

};


/**
 * Event before the selected list item is changed.
 * @param {number} oldIndex
 * @param {number} newIndex
 * @param {boolean} canChange whether the selected item can be changed.
 * @constructor
 * @extends {goog.events.Event}
 */
com.worksap.bootcamp.webeditor.component.BeforeListChangeEvent = function (oldIndex, newIndex, canChange) {
    goog.events.Event.call(this, com.worksap.bootcamp.webeditor.component.ArticleList.EventType.BEFORE_CHANGE);
    this.oldIndex = oldIndex;
    this.newIndex = newIndex;
    this.canChange = canChange;
};
 
/**
 * Event after the selected list item is changed.
 * @param oldIndex
 * @param newIndex
 * @constructor
 * @extends {goog.events.Event}
 */
com.worksap.bootcamp.webeditor.component.ListChangeEvent = function (oldIndex, newIndex) {
    goog.events.Event.call(this, com.worksap.bootcamp.webeditor.component.ArticleList.EventType.CHANGE);
    this.oldIndex = oldIndex;
    this.newIndex = newIndex;
};

