goog.provide('com.worksap.bootcamp.webeditor.mock');

com.worksap.bootcamp.webeditor.mock.ARTICLES = {
    1: {
        id: 1,
        title: 'sample.txt',
        content: 'This is a sample text'
    },
    2: {
        id: 2,
        title: '日本語',
        content: '日本語のテスト'
    },
    3: {
        id: 3,
        title: 'A.java',
        content: 'public class A {\r\n  public static void main(String[] args) {\r\n    System.out.println("Hello, world");\r\n  }\r\n}'
    },
    4: {
        id: 4,
        title: '<script>alert(\'XSS - 1\');</script>',
        content: '<script>alert(\'XSS - 2\');</script>'
    }
};
