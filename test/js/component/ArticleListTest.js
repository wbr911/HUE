goog.require('goog.testing.jsunit');
goog.require('goog.testing.events');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.events.Event');
goog.require('goog.events.KeyCodes');
goog.require('goog.array');

var list;
var async = goog.testing.AsyncTestCase.createAndInstall(document.title);

function setUp() {
    list = new com.worksap.bootcamp.webeditor.component.ArticleList();
    list.decorate(goog.dom.getElement('article-list-ul'));
}

function tearDown() {
    list.setSelectedIndex(1);
    list.dispose();

    // remove the non-default elements
    goog.array.filter(goog.dom.getElement('article-list-ul').children,
        function ($li) {
            var id = Number($li.id.replace('article-list-ul-item-', ''));
            console.log(id);
            return !id || (id !== 1) && (id !== 5);
        }
    ).forEach(function ($li) {
            $li.remove();
        });
}

function test_decorate() {
    assertEquals('After decorate(), two items should be registered',
        2, list.getCount()
    );
    assertEquals('Selected index should be 1 (element with class \'active\'',
        1, list.getSelectedIndex()
    );
}

function test_getNthItem() {
    assertEquals('Index of the 1st item should be 1',
        1, list.getNthItem(1).index
    );
    assertEquals('Index of the 2nd item should be 5',
        5, list.getNthItem(2).index
    );
}

function test_getItem() {
    assertEquals('Index of the item with index 1 should be 1',
        1, list.getItem(1).index
    );
    assertEquals('Index of the item with index 5 should be 5',
        5, list.getItem(5).index
    );
    assertFalse('getItem() with non-registered index should be falsy (null/undefined)',
        Boolean(list.getItem(10))
    );
}

function test_setAndgetSelectedIndex() {
    assertEquals('Selected index should be 1 (before setSelectedIndex() call)',
        1, list.getSelectedIndex()
    );
    list.setSelectedIndex(5);
    assertEquals('Selected index should be 5 (after setSelectedIndex() call)',
        5, list.getSelectedIndex()
    );
    assertFalse('\'active\' class of the DOM should be changed to newly selected item',
        goog.dom.getElement('article-list-ul-item-1').classList.contains('active')
    );
    assertTrue('\'active\' class of the DOM should be changed to newly selected item',
        goog.dom.getElement('article-list-ul-item-5').classList.contains('active')
    );
}

function test_setSelectedIndexShouldDispatchEvents() {
    var isOnChangingCalled = false;
    var isOnChangeCalled = false;

    goog.events.listen(
        list,
        com.worksap.bootcamp.webeditor.component.ArticleList.EventType.BEFORE_CHANGE,
        function (e) {
            isOnChangingCalled = true;
        }
    );

    goog.events.listen(
        list,
        com.worksap.bootcamp.webeditor.component.ArticleList.EventType.CHANGE,
        function (e) {
            isOnChangeCalled = true;
        }
    );

    isOnChangingCalled = false;

    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.CLICK,
            goog.dom.getElement('article-list-ul-item-5')
        )
    );

    assertTrue('A BEFORE_CHANGE event should be called', isOnChangingCalled);
    assertTrue('A CHANGE event should be called', isOnChangeCalled);
    assertEquals('After clicking, selected index should be 5',
        5, list.getSelectedIndex()
    );
    assertFalse('\'active\' class of the DOM should be changed to newly selected item',
        goog.dom.getElement('article-list-ul-item-1').classList.contains('active')
    );
    assertTrue('\'active\' class of the DOM should be changed to newly selected item',
        goog.dom.getElement('article-list-ul-item-5').classList.contains('active')
    );
}


function test_puttingFalseToCanChangeShouldBlockChangeEventDispatch() {
    var isOnChangingCalled = false;
    var isOnChangeCalled = false;

    goog.events.listen(
        list,
        com.worksap.bootcamp.webeditor.component.ArticleList.EventType.BEFORE_CHANGE,
        function (e) {
            isOnChangingCalled = true;
            e.canChange = false;
        }
    );

    goog.events.listen(
        list,
        com.worksap.bootcamp.webeditor.component.ArticleList.EventType.CHANGE,
        function (e) {
            isOnChangeCalled = true;
        }
    );

    isOnChangingCalled = false;

    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.CLICK,
            goog.dom.getElement('article-list-ul-item-5')
        )
    );

    assertTrue('A BEFORE_CHANGE event should be called', isOnChangingCalled);
    assertFalse('A CHANGE event should be called if the event.canChange is set to false ' +
    'in the corresponding BEFORE_CHANGE event', isOnChangeCalled);
    assertEquals('After clicking, selected index should still be 1',
        1, list.getSelectedIndex()
    );
    assertTrue('\'active\' class of the DOM should not be changed to newly selected item',
        goog.dom.getElement('article-list-ul-item-1').classList.contains('active')
    );
    assertFalse('\'active\' class of the DOM should not be changed to newly selected item',
        goog.dom.getElement('article-list-ul-item-5').classList.contains('active')
    );
}

function test_addItem() {
    list.addItem('non-active', 1000, false);
    assertEquals('Item count should be increased by 1',
        3, list.getCount()
    );
    assertEquals('After addItem(), selected index should still be 1',
        1, list.getSelectedIndex()
    );
    assertTrue('\'active\' class of the DOM should not be changed to newly added item',
        goog.dom.getElement('article-list-ul-item-1').classList.contains('active')
    );

    list.addItem('active', 2000, true);
    assertEquals('Item count should be increased by 1',
        4, list.getCount()
    );
    assertEquals('After addItem(), selected index should be 7',
        7, list.getSelectedIndex()
    );
    assertFalse('\'active\' class of the DOM should be changed to newly added item',
        goog.dom.getElement('article-list-ul-item-1').classList.contains('active')
    );
    assertTrue('\'active\' class of the DOM should be changed to newly added item',
        goog.dom.getElement('article-list-ul-item-7').classList.contains('active')
    );
}

function test_addItemShouldEnableHandlingNewlyAddedItems() {
    list.addItem('non-active', 1000, false);
    list.addItem('active', 2000, true);
    list.setSelectedIndex(6);

    assertEquals('setSelectedIndex() should work to newly added items',
        6, list.getSelectedIndex()
    );
    assertTrue('\'active\' class of the DOM should be changed to newly added item',
        goog.dom.getElement('article-list-ul-item-6').classList.contains('active')
    );

    assertEquals('getNthItem() should work',
        1000, list.getNthItem(3).data
    );
    assertEquals('getItem() should work',
        1000, list.getItem(6).data
    );
}