/*******************************************************************************
 * jquery-extensions.js
 ******************************************************************************/

/*******************************************************************************
 * jQuery Static Functions
 ******************************************************************************/

/**
 * Creates a new document element from a given tag and collection of
 * HTMLAttributes.
 * 
 * @param {string} tag Type of document element to create.
 * @param {object} attrs Collection of HTMLAttributes add to the new
 *            HTMLElement.
 * @note Use the attribute key, 'html' to the innerHTML of the new element.
 * @note Use the attribute key, 'class' in quotes or 'className' with/without
 *       quotes to set the 'class' of the new element.
 */
$.build = function(tag, attrs) {
    if (attrs == null) attrs = {};
    var element = $(document.createElement(tag));
    for ( var attr in attrs) {

        var val = attrs[attr];

        switch (attr) {

        case 'className':
            element.attr('class', val);
            break;

        case 'html':
            element.html(val);
            break;

        case 'style':

            switch (typeof val) {

            case 'object':
                for ( var style in val) {
                    element.css(style, val[style]);
                }
                break;

            case 'string':
            default:
                element.attr(attr, val);
                break;

            }

            break;

        case 'text':
            element.text(val);
            break;

        default:
            element.attr(attr, val);
            break;

        }

    }
    return element;
}

/**
 * Defines an enumerated type from a given type, array of enumerated names, and
 * a bitwise flag indicating whether to make the enumeration a bitmask.
 * 
 * @param {string} type
 * @param {array|object} names
 * @param {boolean} bitwise
 * @returns {object} The enumerated type object.
 */
$.enumerate =
    function(type, names, bitwise) {

        if (bitwise == null) bitwise = false;
        eval((type.indexOf('.') > 0 ? '' : 'var ') + type + ' = {};');

        var i = 0;
        for ( var name in names) {

            var value = names[name], cmd = type + '["' + name + '"] = ';

            switch (value) {

            case 'MAX_VALUE':
                cmd +=
                    '(function() { var total = 0; for(var name in ' + type
                        + ') { total += ' + type
                        + '[name]; }; return total; })();'
                break;

            default:
                cmd +=
                    value != null ? value : (bitwise
                        ? (i == 0 ? 1 : (1 << (i))) : i + 1)
                        + ';';
                break;

            }

            eval(cmd);
            ++i;
        }

        return eval(type);

    }

/*******************************************************************************
 * jQuery Instance Methods
 ******************************************************************************/

/**
 * Adjusts the width of each step header in a bootstrap form wizard so that they
 * fill the entire horizontal space in a single row.
 * 
 * @return {void}
 */
$.fn.autoAdjustStepWidth =
    function() {
        $(this).find('.steps li').css('width',
            (100 / $(this).find('.steps li').length) + "%");
    }

/*******************************************************************************
 * jQuery-HTMLElement Instance Methods
 ******************************************************************************/

/**
 * Returns the raw HTML string representation of this HTMLElement.
 * 
 * @return {string} The raw HTML string representation of this HTMLElement.
 */
$.fn.toHTMLString = function() {
    if (!(this[0] instanceof HTMLElement)) { return this.toString(); }
    return this[0].outerHTML;
}

/**
 * Returns the collection of option values contained in this HTMLSelectElement.
 * 
 * @param {array} options Options to set for this HTMLSelectElement. If nothing
 *            is passed for this argument, this method will simply return the
 *            collection of option values contained in this HTMLSelectElement.
 * @return {array} The collection of option values contained in this
 *         HTMLSelectElement.
 */
$.fn.selectOptions = function() {
    if (!(this[0] instanceof HTMLSelectElement)) { return []; }
    var options = [];
    for (var i = 0; i < this[0].options.length; ++i) {
        options.push(this[0].options[i].value);
    }
    return options;
}

/**
 * @param {integer} index Index to set the selectedIndex for this
 *            HTMLSelectElement.
 * @return {integer} The selectedIndex of this HTMLSelectElement.
 */
$.fn.selectIndex = function(index) {
    if (!(this[0] instanceof HTMLSelectElement)) { return null; }
    if (index == null) {
        return this[0].selectedIndex;
    } else {
        this[0].selectedIndex = index;
        return index;
    }
}

/**
 * Returns the value of the selectedIndex of this HTMLSelectElement.
 * 
 * @param {mixed} value Value to set for the this HTMLSelectElement.
 * @return {mixed|integer} Value of the option at the selectedIndex of this
 *         HTMLSelectElement if `value = null` or is not passed; The
 *         selectedIndex of this HTMLSelectElement if the passed value exists in
 *         its options. `null` otherwise.
 */
$.fn.selectValue = function(value) {
    if (!(this[0] instanceof HTMLSelectElement)) { return null; }
    if (value == null) {
        return this[0].options[this[0].selectedIndex].value;
    } else {
        var options = this.selectOptions();
        for (var i = 0; i < options.length; ++i) {
            var option = options[i];
            if (value == option) {
                this[0].selectedIndex = i;
                return i;
            }
        }
    }
}
