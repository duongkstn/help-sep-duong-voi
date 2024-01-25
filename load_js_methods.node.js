const { JSDOM } = require('jsdom');
const fs = require('fs');

// Read the HTML file
const htmlContent = fs.readFileSync('haha.html', 'utf-8');

// Create a virtual DOM using jsdom
const dom = new JSDOM(htmlContent);
const document = dom.window.document;
const window = dom.window;

// Define an array of children to ignore
const children_to_ignore = [undefined];

// Add custom functions to the document object
document.get_css_properties = (element) => {
    // getComputedStyle of window
    var css_properties = window.getComputedStyle(element);
    var filtered_properties = {
        color: css_properties.color,
        backgroundColor: css_properties.backgroundColor,
        fontWeight: css_properties.fontWeight,
        fontSize: css_properties.fontSize,
        opacity: css_properties.opacity,
        display: css_properties.display,
        textDecoration: css_properties.textDecoration,
        border_bottom: css_properties.borderBottom,
        border_top: css_properties.borderTop
    };
    return filtered_properties;
};

// THE MAGIC HERE: node js dont support to get bounding rect of text element natively
// https://stackoverflow.com/questions/6961022/measure-bounding-box-of-text-node-in-javascript
document.get_text_rect = (element) => {
    var height = 0;
    if (document.createRange) {
        var range = document.createRange();
        range.selectNodeContents(element);
        if (range.getBoundingClientRect) {
            var rect = range.getBoundingClientRect();
            if (rect) {
                height = rect.bottom - rect.top;
            }
        }
    }
    return height;
}

document.get_node_obj = (element) => {
    var rect, css_properties

    if (element.tagName == undefined) {
        rect = document.get_text_rect(element);
        css_properties = document.get_css_properties(element.parentElement);
    } else {
        rect = element.getBoundingClientRect();
        css_properties = document.get_css_properties(element);
    }

    var node = {
        tag_name: element.tagName,
        inner_text: element.textContent.trim(),
        id: element.id,
        href: element.href,
        rect: rect,
        css_properties: css_properties,
        children: Array()
    };

    return node;
};

document.get_child_nodes = (element) => {
    var children = Array.from(element.childNodes);

    // Checking if we have to ignore child nodes
    var unique_tags = Array.from(new Set(children.map(item => item.tagName)));
    var filtered_tags = unique_tags.filter(item => !children_to_ignore.includes(item));

    if (filtered_tags.length == 0) {
        children = Array();
    }

    return children;
}

document.get_inner_tree = (element) => {
    var node = document.get_node_obj(element);

    var children = document.get_child_nodes(element);
    for (const each_child of children) {
        node["children"].push(document.get_inner_tree(each_child));
    }

    return node;
};

// Example usage
const kkk = document.get_inner_tree(document.querySelector("BODY"));
console.log(kkk);
