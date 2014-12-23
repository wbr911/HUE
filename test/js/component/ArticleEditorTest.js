goog.require('goog.testing.jsunit');
goog.require('goog.testing.events');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.events.Event');
goog.require('goog.events.KeyCodes');

var editor;
var async = goog.testing.AsyncTestCase.createAndInstall(document.title);

function setUp() {
    editor = new com.worksap.bootcamp.webeditor.component.ArticleEditor();
    editor.decorate(goog.dom.getElement('editor'));
    goog.events.listen(
        editor,
        com.worksap.bootcamp.webeditor.component.ArticleEditor.EventType.VALIDATE_TITLE,
        function (e) {
            var valid = !!e.title;
            editor.setTitleValidationStatus(
                valid ? com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.VALID
                    : com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.INVALID,
                valid ? null : 'Title must be input.'
            );
        }
    );
    editor.setArticle('', '');
}

function tearDown() {
    editor.setArticle('', '');
    editor.dispose();
}

function test_setArticle() {
    var title = 'title';
    var content = 'content';
    editor.setArticle(title, content);

    assertEquals(
        'DOM element (title) should be updated via setArticle()',
        title,
        goog.dom.getElement('editor-title').value
    );
    assertEquals(
        'DOM element (content) should be updated via setArticle()',
        content,
        goog.dom.getElement('editor-content').value
    );
    assertEquals(
        'Property getTitle() should be updated via setArtile()',
        title,
        editor.getTitle()
    );
    assertEquals(
        'Property getContent() should be updated via setArtile()',
        content,
        editor.getContent()
    );
}

function test_onChangeShouldBeCalledWhenTitleInput() {
    goog.events.listen(
        editor,
        goog.events.EventType.CHANGE,
        function (e) {
            isOnChangeCalled = true;
            async.continueTesting();
        }
    );

    var isOnChangeCalled = false;
    var $title = goog.dom.getElement('editor-title');
    async.waitForAsync('title');
    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.INPUT, $title)
    );
    assertTrue('An CHANGE event should be called when the title input box is input', isOnChangeCalled);
}

function test_onChangeShouldBeCalledWhenContentInput() {
    goog.events.listen(
        editor,
        goog.events.EventType.CHANGE,
        function (e) {
            isOnChangeCalled = true;
            async.continueTesting();
        }
    );

    var isOnChangeCalled = false;
    var $content = goog.dom.getElement('editor-content');
    async.waitForAsync('content');
    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.INPUT, $content)
    );
    assertTrue('An CHANGE event should be called when the content text area is input', isOnChangeCalled);
}

function test_validationNotExecuted() {
    /*
     * The aim of this test case is only an anchor for development
     * and this test case can be used as reference.
     * This test case will be succeeded only when you implement ArticleEditor in the standard way,
     * You may implement it as omitting status control if no validation event is assigned to it,
     * and it will be result in the failure in this test case.
     * You may remove this test case completely if you want.
     */
    assertTrue('Before an INPUT event is fired, status should be valid', editor.isTitleValid());

    var $title = goog.dom.getElement('editor-title');
    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.INPUT, $title)
    );

    assertFalse('Before an INPUT event is fired and if the validation is not executed, status get to be invalid', editor.isTitleValid());
}

function test_validationSucceeded() {
    assertTrue('Before an INPUT event is fired, status should be valid', editor.isTitleValid());

    goog.events.listen(
        editor,
        com.worksap.bootcamp.webeditor.component.ArticleEditor.EventType.VALIDATE_TITLE,
        function (e) {
            editor.setTitleValidationStatus(
                com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.VALID,
                ''
            );
            assertTrue('After an INPUT event is fired, status should still be valid', editor.isTitleValid());
            async.continueTesting();
        }
    );

    var $title = goog.dom.getElement('editor-title');
    async.waitForAsync('title');
    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.INPUT, $title)
    );
}

function test_validationFailed() {
    assertTrue('Before an INPUT event is fired, status should be valid', editor.isTitleValid());

    goog.events.listen(
        editor,
        com.worksap.bootcamp.webeditor.component.ArticleEditor.EventType.VALIDATE_TITLE,
        function (e) {
            editor.setTitleValidationStatus(
                com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.INVALID,
                ''
            );
            assertFalse('After an INPUT event is fired, status should get to be invalid', editor.isTitleValid());
            async.continueTesting();
        }
    );

    var $title = goog.dom.getElement('editor-title');
    async.waitForAsync('title');
    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.INPUT, $title)
    );
}

function test_setTitleValidationStatus_Valid() {
    editor.setTitleValidationStatus(com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.VALID, '');
    assertTrue('When validation status is valid, ArticleEditor#isValid() should be true', editor.isTitleValid());
    assertTrue(
        'When validation status is VALID, element [.article-title] should have a class \'valid\'',
        goog.dom.getElement('editor-title').classList.contains('valid')
    );
    assertTrue(
        'When validation status is VALID, element [.article-title-error-messages] should have a class \'valid\'',
        goog.dom.getElement('editor-error-messages').classList.contains('valid')
    );
}

function test_setTitleValidationStatus_Invalid() {
    var errorMessage = 'message';
    editor.setTitleValidationStatus(com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.INVALID, errorMessage);
    assertFalse('When validation status is INVALID, ArticleEditor#isValid() should be false', editor.isTitleValid());
    assertTrue(
        'When validation status is INVALID, element [.article-title] should have a class \'invalid\'',
        goog.dom.getElement('editor-title').classList.contains('invalid')
    );
    assertTrue(
        'When validation status is INVALID, element [.article-title-error-messages] should have a class \'invalid\'',
        goog.dom.getElement('editor-error-messages').classList.contains('invalid')
    );
    assertEquals(
        'When validation status is INVALID, error message should be set to the element [.article-title-error-messages]',
        errorMessage,
        goog.dom.getElement('editor-error-messages').innerText
    );
}

function test_setTitleValidationStatus_Validating() {
    var errorMessage = 'message';
    editor.setTitleValidationStatus(com.worksap.bootcamp.webeditor.component.ArticleEditor.ValidationStatus.VALIDATING, errorMessage);
    assertFalse('When validation status is VALIDATING, ArticleEditor#isValid() should be false', editor.isTitleValid());
    assertTrue(
        'When validation status is VALIDATING, element [.article-title] should have a class \'validating\'',
        goog.dom.getElement('editor-title').classList.contains('validating')
    );
    assertTrue(
        'When validation status is VALIDATING, element [.article-title-error-messages] should have a class \'validating\'',
        goog.dom.getElement('editor-error-messages').classList.contains('validating')
    );
    assertEquals(
        'When validation status is VALIDATING, error message should be set to the element [.article-title-error-messages]',
        errorMessage,
        goog.dom.getElement('editor-error-messages').innerText
    );
}

function test_isModifiedWhenTitleInput() {
    assertFalse('Initial status of ArticleEditor#isModified() should be false', editor.isModified());

    var $title = goog.dom.getElement('editor-title');
    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.INPUT, $title)
    );
    assertTrue('After INPUT event fired, ArticleEditor#isModified() should be true', editor.isModified());

    editor.setArticle('hoge', 'fuga');
    assertFalse('Just after ArticleEditor#setArticle() called, ArticleEditor#isModified() should be false', editor.isModified());
}

function test_isModifiedWhenContentInput() {
    assertFalse('Initial status of ArticleEditor#isModified() should be false', editor.isModified());

    var $content = goog.dom.getElement('editor-content');
    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.INPUT, $content)
    );
    assertTrue('After INPUT event fired, ArticleEditor#isModified() should be true', editor.isModified());

    editor.setArticle('hoge', 'fuga');
    assertFalse('Just after ArticleEditor#setArticle() called, ArticleEditor#isModified() should be false', editor.isModified());
}
