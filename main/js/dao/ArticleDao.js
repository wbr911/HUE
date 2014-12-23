goog.provide('com.worksap.bootcamp.webeditor.dao.ArticleDao');
/**
 *
 * @param {Object.<number, {id: number, title: string, content: string}>=} mockData optional mock article data
 * @constructor
 */
com.worksap.bootcamp.webeditor.dao.ArticleDao = function (mockData) {
    'use strict';

    /**
     * @type {Object.<number, {id: number, title: string, content: string}>}
     * @private
     */
    this.data_ = mockData || {};

    /**
     * @type {number}
     * @private
     */
    this.maxId_ = 0;
    for (var id in this.data_) {
        if (this.maxId_ < Number(id)) {
            this.maxId_ = Number(id);
        }
    }
};

(function (ArticleDao) {
    'use strict';

    /**
     * @param {function(Array.<string>)} callback
     */
    ArticleDao.prototype.findTitles = function (callback) {
        var _self = this;
        window.setTimeout(function () {
            var titles = [];
            for (var id in _self.data_) {
                if (!_self.data_.hasOwnProperty(id)) {
                    continue;
                }
                titles[id] = _self.data_[id].title;
            }
            if (callback) {
                callback.call(null, titles);
            }
        }, 0);
    };
    ArticleDao.prototype.findAllArticles = function (callback) {
        var _self = this;
        window.setTimeout(function () {
            var articles = [];
            for (var id in _self.data_) {
                if (!_self.data_.hasOwnProperty(id)) {
                    continue;
                }
                articles.push(_self.data_[id]);
            }
            if (callback) {
                callback.call(null, articles);
            }
        }, 0);
    };

    /**
     *
     * @param {number} id
     * @param {function({id: number, title: string, content: string}?)} callback
     */
    ArticleDao.prototype.findById = function (id, callback) {
        var _self = this;
        window.setTimeout(function () {
            if (callback) {
                callback.call(null, _self.data_[id]);
            }
        }, 0);
    };

    /**
     * @param article {{title: string, content: string}}
     * @param {function({id: number, title: string, content: string}?)} callback
     */
    ArticleDao.prototype.create = function (article, callback) {
        var _self = this;
        window.setTimeout(function () {
            var id = ++_self.maxId_;
            var created = {
                id: id,
                title: article.title,
                content: article.content
            };
            _self.data_[id] = created;
            if (callback) {
                callback.call(null, created);
            }
        }, 0);
    };

    /**
     * @param article {{id: number, title: string, content: string}}
     */
    ArticleDao.prototype.update = function (article) {
        var _self = this;
        window.setTimeout(function () {
            var id = article.id;
            if (!_self.data_[id]) {
                throw 'Article not found - id: ' + id + ' / ' + JSON.stringify(article);
            }
            _self.data_[id] = {
                id: id,
                title: article.title,
                content: article.content
            };
        }, 0);
    };

    /**
     * @param id
     */
    ArticleDao.prototype.deleteById = function (id) {
        var _self = this;
        window.setTimeout(function () {
            if (!_self.data_[id]) {
                throw 'Article not found - id: ' + id;
            }
            delete _self.data_[id];
        }, 0);
    };
})(com.worksap.bootcamp.webeditor.dao.ArticleDao);