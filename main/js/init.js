goog.require('com.worksap.bootcamp.webeditor.Application');
goog.require('com.worksap.bootcamp.webeditor.component.ArticleList');
goog.require('com.worksap.bootcamp.webeditor.component.ArticleEditor');
goog.require('com.worksap.bootcamp.webeditor.dao.ArticleDao');
goog.require('com.worksap.bootcamp.webeditor.mock');
goog.require('com.worksap.bootcamp.webeditor.validator.Validator');

(function () {
    var articleDao = new com.worksap.bootcamp.webeditor.dao.ArticleDao(
        // if you want to test with mock data, remove comment "//" on the next line
        com.worksap.bootcamp.webeditor.mock.ARTICLES
    );
    var validator = new com.worksap.bootcamp.webeditor.validator.Validator(
        articleDao
    );
    var application = new com.worksap.bootcamp.webeditor.Application(
        articleDao, validator
    );
})();

