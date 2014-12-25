goog.provide('com.worksap.bootcamp.webeditor.validator.Validator');
goog.require('com.worksap.bootcamp.webeditor.dao.ArticleDao');

/**
 *
 * @param {com.worksap.bootcamp.webeditor.dao.ArticleDao} articleDao
 * @constructor
 */
com.worksap.bootcamp.webeditor.validator.Validator = function (articleDao) {
    this.articleDao = articleDao;
};
(function (Validator) {
    /**
     * Validate if the article title is valid.
     * @param {number} id
     * @param {string} title
     * @param {function(boolean, string=)} callback,
     *   1st arg: whether the article title is valid.
     *   2nd arg: the error message if the target is invalid, otherwise not assigned (undefined).
     */
    Validator.prototype.validateTitle = function (id, title, callback) {
        if (title === '' || title === undefined) {
            callback(false, 'title can not be empty');
            return;
        }
        this.articleDao.findTitles(function (titles) {
            var l = titles.length;
            for (var i = 0; i < l; i++) {
                if (titles[i] === title && i !== id) {
                    callback(false, 'title already exists');
                    return;
                }
            }
            callback(true);
        });
    };
})(com.worksap.bootcamp.webeditor.validator.Validator);