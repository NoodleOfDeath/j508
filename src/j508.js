/*******************************************************************************
 * j508.js
 ******************************************************************************/

/*******************************************************************************
 * Constructor Methods
 ******************************************************************************/

/**
 * <p>
 * <code>j508</code> is currently not an instantiable API prototype. All of
 * its methods are static with <code>j508.makeCompliant</code> as the primary
 * method used, and a custom jQuery alias method
 * <code>$.fn.make508Compliant</code>.
 * </p>
 * 
 * @returns {j508}
 */
function j508() {
}

/**
 * <p>
 * A simple data structure used to represent Section 508 violations encountered
 * when the j508 API attempts to clean up a DOM element.
 * </p>
 * 
 * @param {integer} code
 * @param {string} message
 * @param {mixed} context
 * @param {boolean} fixed
 * @param {string} comments
 * @returns {j508Violation}
 */
function j508Violation(code, message, context, fixed, comments) {
    this.code = code != null ? code : 'No violation code.';
    this.message = message != null ? message : 'No violation message';
    this.context = context != null ? context : 'No violation context.';
    this.fixed = fixed != null ? fixed : false;
    this.comments = comments != null ? comments : 'No violation comments.';
}

/*******************************************************************************
 * Static Methods
 ******************************************************************************/

/**
 * Enumerated bitmask generated at runtime used to specify which rules to either
 * run or output to the console. Mainly for debug purposes.
 */
$.enumerate('j508.Rule', {
    A_BlankTarget : null, //
    A_MissingTabindex : null, //
    A_MissingTitle : null, //
    Button_MissingTabindex : null,//
    Button_MissingTitle : null, //
    DataToggle_RestoreTitle : null, //
    DatePicker_AddFix : null,
    DisabledInput_RemoveTabindex : null,
    DropDown_AddFix : null,
    Img_MissingTabindex : null,
    TD_MissingScope : null, //
    TH_MissingScope : null, //
    All : 'MAX_VALUE',
}, true);

/**
 * String constants used by the j508 API.
 */
j508.Message =
    {

        A_BlankTarget : 'Inserting missing sr-only element after blank target hyperlink. :: %O',
        A_MissingTabindex : 'Adding missing tabindex attribute as 0 for hyperlink :: %O',
        A_MissingTitle : 'Adding missing title attribute as "%s" for hyperlink :: %O',
        Button_MissingTabindex : 'Adding missing tabindex as 0 for hyperlink :: %O',
        Button_MissingTitle : 'Adding missing title attribute as "%s" for button :: %O',
        DataToggle_RestoreTitle : 'Restoring title as "%s" for data-toggle :: %O',
        DatePicker_AddFix : 'Making DatePicker 508 compliant :: %O',
        DisabledInput_RemoveTabindex : 'Setting tabindex attribute to %s for disabled input :: %O',
        DropDown_AddFix : 'Making DropDown menu visible when overflow :: %O',
        Img_MissingTabindex : 'Adding missing tabindex as 0 for image :: %O',
        TD_MissingScope : 'Adding missing scope attribute as "%s" for table data-cell :: %O',
        TH_MissingScope : 'Adding missing scope attribute as "%s" for table data-cell :: %O',

        WARNING_A_MissingTitle : 'WARNING: Unable to find an appropriate title for anonymous hyperlink. The title "%s" was used instead.',

    };

j508.Data = {
    ActiveDropDowns : [],
}

/**
 * <p>
 * Forces a given <code>node</code> to comply with 508 user interface
 * standards. If no argument is passed for the <code>node</code> parameter</small>
 * the entire document body and its recursive nested elements will be used
 * instead.
 * </p>
 * <p>
 * The second parameter is a standard key-value configuration object. If a
 * non-HTMLElement key-value object argument is provided as the first parameter,
 * the method will use that value configuration object instead of the node and
 * run its operations on the entire doucment body.
 * </p>
 * <h3>Rules</h3>
 * <hr />
 * <p>
 * If a <code>rules</code> array option is provided in the configuration
 * argument passed as the second parameter, this method will only run the
 * associated rule(s) in the passed array on the given <code>node</code>
 * argument passed as the second parameter.
 * </p>
 * <p>
 * Not setting this options sets <code>rules</code> to its default value which
 * is <code>j508.Rule.All</code> which will run all 508 rules on the given
 * <code>node</code> argument passed as the second parameter.
 * </p>
 * <h5>Example</h>
 * <p>
 * <div class="code">
 * 
 * <pre>
 * <code class="comment">
 * // Only enforce 508 compliance for a tags with a _blank target attribute
 * // and buttons without a tabindex attribute.
 * </code>
 * j508.makeCompliant($('document.body'), {
 *     rules : j508.Rule.A_BlankTarget + j508.Rule.Button_MissingTabindex,
 * });
 * <code class="comment">
 * // Enforce all 508 rules on the entire document body and all of its nested
 * // elements.
 * </code>
 * j508.makeCompliant();
 * </pre>
 * 
 * </div>
 * </p>
 * <h3>Debug</h3>
 * <hr />
 * <p>
 * If a <code>debug</code> array option is provided in the configuration
 * argument passed as the second parameter, this method will log debugging
 * information for the associated rule(s) (IFF also included in the
 * <code>rules</code> option) in the passed array on the given
 * <code>node</code> argument passed as the second parameter.
 * </p>
 * <p>
 * Passing <code>true</code> as the only parameter for this method will set
 * the <code>debug</code> option to the default value of
 * <code>j508.Rule.All</code>.
 * </p>
 * <h5>Example</h>
 * <p>
 * <div class="code">
 * 
 * <pre>
 * <code class="comment">
 * // Only display debugging messages in the console for a tags with a _blank  
 * // target attribute and buttons without a tabindex attribute.
 * </code>
 * j508.makeCompliant(document.body, {
 *     debug : j508.Rule.A_BlankTarget + j508.Rule.Button_MissingTabindex,
 * });
 * <code class="comment">
 * // Display all debug messages. All four method calls below do exactly the 
 * // same thing.
 * </code>
 * j508.makeCompliant('document.body', true);
 * j508.makeCompliant(true);
 * j508.makeCompliant(document.body, {
 *     debug : j508.Rule.All,
 * });
 * j508.makeCompliant({
 *     debug : j508.Rule.All,
 * });
 * </pre>
 * 
 * </div>
 * </p>
 * <h4>jQuery</h4>
 * <hr />
 * <p>
 * <code>j508</code> can also be used in combinations with jQuery like in the
 * following example.
 * </p>
 * <h5>Example</h5>
 * <div class="code">
 * 
 * <pre>
 * $(document.body).make508Compliant();
 * $(document.body).make508Compliant({
 *     rules : j508.Rule.Button_MissingTabindex,
 *     debug : j508.Rule.All,
 * });
 * </pre>
 * 
 * </div> <style> .code { background: #f8f8f8; padding: 10px; } .code .comment {
 * color: green; } </style>
 * 
 * @param {mixed} node A DOM Node or string id.
 * @param {mixed} opts Key-value configuration object.
 */
j508.makeCompliant =
    function(node, opts) {

        if (opts == null) opts = {};
        if (typeof opts == 'number') opts = {
            debug : opts,
        };

        var violations = [];
        var loggedViolations = [];
        var failedViolations = []

        if (node != null && !($(node)[0] instanceof HTMLElement)) {
            switch (typeof node) {

            case 'boolean':
                opts.debug = j508.Rule.All;
                break;

            case 'number':
                opts.rules = node;
                break;

            case 'object':
            default:
                opts = node, node = null;
                break;
            }
        }

        if (opts.rules == null) opts.rules = j508.Rule.All;

        if (opts.debug === true) opts.debug = j508.Rule.All;
        else if (opts.debug == null) opts.debug = 0;

        function log(rule, message, node, fixed) {
            var violation = new j508Violation(rule, message, node, fixed);
            violations.push(violation);
            if (opts.debug & rule) {
                loggedViolations.push(violation);
                console.log(loggedViolations.length + '. ' + message, node);
            }
        }

        var target = node != null ? $(node) : $(document.body);

        if (opts.rules & j508.Rule.A_BlankTarget) {
            // Add title attribute to all a tags the open a new window.
            var targets =
                target.find('a[target=_blank],a[onclick*="window.open"]');
            targets.each(function(i, e) {
                var next = $(this).next();
                if (next.attr('class') == null ||
                    next.attr('class').indexOf('sr-only') < 0) {
                    $(this).after($.build('span', {
                        html : '(link opens in a new tab)',
                        className : 'sr-only',
                    }));
                }
                var message = j508.Message.A_BlankTarget;
                log(j508.Rule.A_BlankTarget, message, this, true);
            });
        }

        if (opts.rules & j508.Rule.A_MissingTabindex) {
            // Add a tabindex of 0 to any a element without one.
            var targets = target.find('a:not([tabindex])');
            targets.each(function(i, e) {
                $(this).attr('tabindex', '0');
                var message = j508.Message.A_MissingTabindex;
                log(j508.Rule.A_MissingTabindex, message, this, true);
            });
        }

        if (opts.rules & j508.Rule.A_MissingTitle) {
            // Add title attribute to all a elements without one.
            var targets = target.find('a:not([title])');
            targets
                .each(function(i, e) {

                    var title, message, fixed = true;
                    title =
                        $(this).html().replace(/<.*?>/g, '').replace(/\s\s+/g,
                            ' ');
                    if (!title || title.trim() == '') title =
                        $(this).attr('id');
                    if (!title || title.trim() == '') title =
                        $(this).attr('name');
                    if (!title || title.trim() == '') title =
                        $(this).attr('href');
                    if (!title || title.trim() == '') {
                        fixed = false;
                        title = 'Anonymous hyperlink';
                        message =
                            j508.Message.WARNING_A_MissingTitle.replace(/%s/,
                                title);
                        failedViolations.push(new j508Violation(
                            j508.Rule.A_MissingTitle, message, this, fixed))
                    } else {
                        message =
                            j508.Message.A_MissingTitle.replace(/%s/, title);
                    }

                    $(this).attr('title', title);

                    log(j508.Rule.A_MissingTitle, message, this, fixed);

                });
        }

        if (opts.rules & j508.Rule.Button_MissingTabindex) {
            // Add a tabindex of 0 to any button element without one.
            var targets = target.find('button:not([tabindex])');
            targets.each(function(i, e) {
                $(this).attr('tabindex', '0');
                var message = j508.Message.Button_MissingTabindex;
                log(j508.Rule.Button_MissingTabindex, message, this, true);
            });
        }

        if (opts.rules & j508.Rule.Button_MissingTitle) {
            // Add title attribute to all a button elements without one.
            var targets = target.find('button:not([title])');
            targets.each(function(i, e) {
                var title =
                    $(this).html().replace(/<.*?>/g, '').replace(/\s\s+/g, ' ')
                        .trim();
                if (!title || title.trim() == '') return;
                $(this).attr('title', title);
                var message =
                    j508.Message.Button_MissingTitle.replace(/%s/, title);
                log(j508.Rule.Button_MissingTitle, message, this, true);
            });
        }

        if (opts.rules & j508.Rule.DataToggle_RestoreTitle) {
            // Re-add title attributes removed by Bootstrap data-toggle API.
            var targets = target.find('[data-original-title]');
            targets.each(function(i, e) {
                var title = $(this).attr('data-original-title');
                $(this).attr('title', title);
                var message =
                    j508.Message.DataToggle_RestoreTitle.replace(/%s/, title);
                log(j508.Rule.DataToggle_RestoreTitle, message, this, true);
            });
        }

        if (opts.rules & j508.Rule.DatePicker_AddFix) {
            // Make DatePickers 508 compliant
            var targets =
                target
                    .find('.TimeSlotTable, .TimeSlotTable .TimeSlot.available a.timeSlotLinkContent');
            targets.each(function(i, e) {
                $(this).off('keyup.j508');
                $(this).on(
                    'keyup.j508',
                    function(e) {
                        switch ($(e).keyCode()) {

                        case 13:
                            e.preventDefault();
                            var focusTarget =
                                $(this).closest('.dataTables_wrapper').parent()
                                    .next();
                            setTimeout(function() {
                                focusTarget.focus();
                            }, 10);
                            break;

                        }
                    });
            });
            var message = j508.Message.DatePicker_AddFix;
            log(j508.Rule.DatePicker_AddFix, message, this, true);
        }

        if (opts.rules & j508.Rule.DisabledInput_RemoveTabindex) {
            // Re-add title attributes removed by Bootstrap data-toggle API.
            var targets = target.find('[disabled],[enabled=false]');
            targets
                .each(function(i, e) {
                    $(this).attr('tabindex', '-1');
                    var message =
                        j508.Message.DisabledInput_RemoveTabindex.replace(/%s/,
                            '-1');
                    log(j508.Rule.DisabledInput_RemoveTabindex, message, this,
                        true);
                });
        }

        if (opts.rules & j508.Rule.DropDown_AddFix) {

            // Add fixes to dropdown menus that are cut off by hidden overflow

            var hideOpenDropDowns = function(e) {
                $(j508.Data.ActiveDropDowns).each(function(i, e) {
                    $(this).trigger('hide.bs.dropdown.j508');
                });
                j508.Data.ActiveDropDowns = [];
            };

            $('*').add(document).each(function(i, e) {
                $(this).off('scroll.bs.dropdown.j508');
                $(this).on('scroll.bs.dropdown.j508', hideOpenDropDowns);
            });

            $(window).off('resize.bs.dropdown.j508');
            $(window).on('resize.bs.dropdown.j508', hideOpenDropDowns);

            var targets = target.find('ul.dropdown-menu:not([class*=inline])');
            targets.each(function(i, e) {

                var parent = $(this).parent();

                parent.off('show.bs.dropdown.j508');
                parent.on('show.bs.dropdown.j508', function(e) {

                    var dropdown =
                        $(this).find('ul.dropdown-menu:not(.inline)').first();

                    j508.Data.ActiveDropDowns.push(dropdown);

                    var x =
                        $(this).offset().left + dropdown.width() > $(window)
                            .width() ? $(this).offset().left + $(this).width() -
                            dropdown.width() : $(this).offset().left;
                    if (x + dropdown.width() > $(window).width() - 50) {
                        x = $(window).width() - dropdown.width() - 50;
                    }

                    var y = $(this).offset().top + $(this)[0].offsetHeight;
                    dropdown.detach();
                    $(document.body).append(dropdown.css({
                        position : 'absolute',
                        display : 'block',
                        left : x,
                        top : y,
                    }));

                    $(this).off('hide.bs.dropdown.j508');
                    $(this).on('hide.bs.dropdown.j508', function(e) {
                        dropdown.detach();
                        parent.append(dropdown.css({
                            position : 'absolute',
                            display : 'none',
                        }));
                        j508.Data.ActiveDropDowns = [];
                    });

                });

                parent.off('shown.bs.dropdown.j508');
                parent.on('shown.bs.dropdown.j508', function(e) {
                    setTimeout(function() {
                        var dropdown = $(j508.Data.ActiveDropDowns[0]);
                        dropdown.find('a').eq(0).focus();
                    }, 10);
                });

                var message = j508.Message.DropDown_AddFix;
                log(j508.Rule.DropDown_AddFix, message, this, true);

            });

        }

        if (opts.rules & j508.Rule.Img_MissingTabindex) {
            // Add a tabindex of 0 to any button element without one.
            var targets = target.find('img:not([tabindex])');
            targets.each(function(i, e) {
                $(this).attr('tabindex', '0');
                var message = j508.Message.Img_MissingTabindex;
                log(j508.Rule.Img_MissingTabindex, message, this, true);
            });
        }

        if (opts.rules & j508.Rule.TD_MissingScope) {
            // Add scope attribute for all td elements without one.
            var targets = target.find('tbody tr td:not([scope])');
            targets.each(function(i, e) {
                $(this).attr('scope', 'rowgroup');
                var message =
                    j508.Message.TD_MissingScope.replace(/%s/, 'rowgroup');
                log(j508.Rule.TD_MissingScope, message, this, true);
            });
        }

        if (opts.rules & j508.Rule.TH_MissingScope) {
            // Add scope attribute to all td elements without one.
            var targets = target.find('thead tr th:not([scope])');
            targets.each(function(i, e) {
                $(this).attr('scope', 'colgroup');
                var message =
                    j508.Message.TH_MissingScope.replace(/%s/, 'colgroup');
                log(j508.Rule.TH_MissingScope, message, this, true);
            });
        }

        if (opts.debug > 0) {
            console
                .log(
                    '%d Violations Logged. %d Total Violations Found. :: [Logged Violations %O] :: [All Violations %O]',
                    loggedViolations.length, violations.length,
                    loggedViolations, violations);
            console
                .log(
                    '%d Violations Fixed. Unable to Fix %d Violations. :: [Unfixed Violations %O]',
                    violations.length - failedViolations.length,
                    failedViolations.length, failedViolations);
        }

    }

/**
 * Map that points a set of unique ids to the DOM elements that have the event
 * listener hooked to them
 */
j508.hooks = {};

/**
 * Hooks the tab key to be confined only elements inside of a given
 * {@code element}.
 * 
 * @param {string} id - Id of this event listener which can be used to "unhook"
 *            it in the future.
 * @param {Element} element - Element in which to confine the tab index to.
 * @returns {void}
 */
j508.hookTabIndex = function(id, element) {
    var elements = $(element).find(':enabled').sort(function(a, b) {
        return a.className < b.className;
    });
    if (elements.length < 1) return;
    this.hooks['keydown.j508.tab.' + id] = elements.last();
    elements[0].focus();
    $(elements.last()).on('keydown.j508.tab.' + id, function(e) {
        switch ($(e).keyCode()) {
        case 9:
            e.preventDefault();
            var elements = $(element).find(':enabled').sort(function(a, b) {
                return a.className < b.className;
            })
            if (elements.length < 1) return;
            elements.first().focus();
            break;
        default:
            break;
        }
    });
}

/**
 * Unhooks the keypress event listener associated with {@code id}.
 * 
 * @param {string} id - Id of the event listener to unhook.
 * @returns {void}
 */
j508.unhookTabIndex = function(id) {
    if (element = this.hooks['keydown.j508.tab.' + id]) {
        $(element).off('keydown.j508.tab.' + id);
    }
    delete this.hooks['keydown.j508.tab.' + id];
}

/*******************************************************************************
 * jQuery Extensions
 ******************************************************************************/

/**
 * <p>
 * Alias for <a href="j508#makeCompliant"> <code>j508.makeCompliant</code></a>.
 * </p>
 * 
 * @see j508#makeCompliant
 * @param {object} opts
 */
$.fn.make508Compliant = function(opts) {
    j508.makeCompliant(this, opts);
}

/**
 * Alias for <code>j508.hookTabIndex(id, this)</code>.
 */
$.fn.hook508TabIndex = function(id) {
    j508.hookTabIndex(id, this);
}

/**
 * Alias for <code>j508.unhookTabIndex(id)</code>.
 */
$.unhook508TabIndex = function(id) {
    j508.unhookTabIndex(id, this);
}

/*******************************************************************************
 * jquery-extensions.js
 ******************************************************************************/

/*******************************************************************************
 * jQuery Static Functions
 ******************************************************************************/

/**
 * <p>
 * Creates a new document element from a given tag and mapping of HTMLAttributes
 * to HTMLAttributeValues.
 * </p>
 * 
 * @note Use the attribute key, 'html' to the innerHTML of the new element.
 * @note Use the attribute key, 'class' in quotes or 'className' with/without
 *       quotes to set the 'class' of the new element.
 * @param {string} tag Type of document $element to create by tag name.
 * @param {object} attrs Collection of HTMLAttributes add to the new
 *            HTMLElement.
 */
$.build =
    function(tag, attrs) {

        attrs = attrs || {};
        var $element = $(document.createElement(tag));

        for ( var attr in attrs) {

            var val = attrs[attr];
            attr =
                attr.replace(/^_|Name$/, '').replace(
                    /([^A-Z ])([A-Z])(?=[a-z])/g, '$1-' + '$2'.toLowerCase());

            switch (attr) {

            case 'html':
                $element.html(val);
                break;

            case 'style':

                switch (typeof val) {

                case 'object':
                    for ( var style in val)
                        $element.css(style, val[style]);
                    break;

                case 'string':
                default:
                    $element.attr(attr, val);
                    break;

                }

                break;

            case 'text':
                $element.text(val);
                break;

            default:
                $element.attr(attr, val);
                break;

            }

        }
        return $element;
    }

/**
 * <p>
 * Defines an enumerated type at runtime from a given type, array of enumerated
 * names, and a bitwise flag indicating whether to make the enumeration a
 * bitmask.
 * </p>
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
                    '(function() { var total = 0; for(var name in ' + type +
                        ') { total += ' + type +
                        '[name]; }; return total; })();'
                break;

            default:
                cmd +=
                    value != null ? value : (bitwise
                        ? (i == 0 ? 1 : (1 << (i))) : i + 1) +
                        ';';
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
$.fn.adjustStepHeaders = function() {
    var targets = $(this).find('.steps li');
    targets.each(function(i, e) {
        $(this).css('width', (100 / targets.length) + "%");
    });
}

/*******************************************************************************
 * jQuery-DataTable Methods
 ******************************************************************************/

/**
 * Adjust the columns of a given <code>HTMLTableElement</code> and any nested
 * data tables inside of it.
 * 
 * @param {mixed} target Typically the table whose columns are to be adjusted.
 *            If nothing is passed for this parameter the entire document body
 *            is used instead.
 * @returns {[HTMLTableElement]} the DOM elements affected by this operation.
 */
$.adjustDataTableColumns = function(target) {
    target = target != null ? $(target) : $(document.body);
    var affectedTables = [];
    target.find('.dataTable').addBack().each(function(i, e) {
        if (!(this[0] instanceof HTMLTableElement)) return;
        affectedTables.push(this);
        $(this).DataTable().columns.adjust();
    });
    return affectedTables;
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
    if (!$(this).DOMCheck()) return this.toString();
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
$.fn.options = function() {
    if (!$(this).DOMCheck(HTMLSelectElement)) return [];
    var options = [];
    for (var i = 0; i < this[0].options.length; ++i)
        options.push(this[0].options[i].value);
    return options;
}

/**
 * @param {integer} index Index to set the selectedIndex for this
 *            HTMLSelectElement.
 * @return {integer} The selectedIndex of this HTMLSelectElement.
 */
$.fn.selectedIndex = function(index) {
    if (!$(this).DOMCheck(HTMLSelectElement)) return null;
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
$.fn.selectedValue = function(value) {
    if (!$(this).DOMCheck(HTMLSelectElement)) return null;
    if (value == null) {
        return this[0].options[this[0].selectedIndex].value;
    } else {
        var options = this.options();
        for (var i = 0; i < options.length; ++i) {
            var option = options[i];
            if (value == option) {
                this[0].selectedIndex = i;
                return i;
            }
        }
    }
}

/**
 * Returns the value of the selectedIndex of this HTMLSelectElement.
 * 
 * @param {mixed} value Value to set for the this HTMLSelectElement.
 * @return {mixed|$.fn} Value of the option at the selectedIndex of this
 *         HTMLSelectElement if `value = null` or is not passed; The
 *         selectedIndex of this HTMLSelectElement if the passed value exists in
 *         its options. `null` otherwise.
 */
$.fn.selectedOption = function(value) {
    if (!$(this).DOMCheck(HTMLSelectElement)) return null;
    if (value == null) {
        return this[0].options[this[0].selectedIndex];
    } else {
        var options = this.options();
        for (var i = 0; i < options.length; ++i) {
            var option = options[i];
            if (value == option) {
                this[0].selectedIndex = i;
                return $(this);
            }
        }
    }
}

/**
 * Makes this HTML element constrain its width and scroll width overflow.
 * 
 * @param {int|string} width to set as the max-width of this element. Passing no
 *            argument for this parameter will simply set overflow-x to auto.
 * @returns {$.fn} a jQuery wrapper object for method chaining.
 */
$.fn.scrollWidth = function(width) {
    if (!$(this).DOMCheck()) return null;
    if ($(this).parent() == null) $(this).wrap($.build('div'));
    if (width != null) {
        width = typeof width == 'number' ? width + 'px' : width;
        $(this).parent().css('max-width', width);
    }
    $(this).parent().css('overflow-x', 'auto');
    return $(this);
}

/**
 * <p>
 * Makes this HTML element constrain its height and scroll height overflow.
 * </p>
 * 
 * @param {int|string} height to set as the max-width of this element. Passing
 *            no argument for this parameter will simply set overflow-y to auto.
 * @returns {$.fn} a jQuery wrapper object for method chaining.
 */
$.fn.scrollHeight = function(height) {
    if (!$(this).DOMCheck()) return null;
    if ($(this).parent() == null) $(this).wrap($.build('div'));
    if (height != null) {
        height = typeof height == 'number' ? height : height + 'px';
        $(this).parent().css('max-height', height);
    }
    $(this).parent().css('overflow-y', 'auto');
    return $(this);
}

/**
 * @returns <code>true</code> IFF <code>this[0] instanceof type == true</code>
 * @param {Node.Type} type default is <code>HTMLElement</code>
 */
$.fn.DOMCheck = function(type) {
    type = type || HTMLElement;
    return this[0] instanceof type;
}

/**
 * @returns {integer} The keycode of a KeyboardEvent. <code>false</code>
 *          otherwise.
 */
$.fn.keyCode = function() {
    var e = this[0] || window.event;
    return e.which || e.keyCode;
}

/**
 * @returns {mixed|$.fn}
 */
$.fn.isChecked = function() {
    return this[0].checked;
}

/**
 * @returns {mixed|$.fn}
 */
$.fn.check = function(action) {
    if (action == null) action = true;
    this[0].checked = action;
}

/**
 * @returns {mixed|$.fn}
 */
$.fn.uncheck = function() {
    this[0].checked = false;
}

/**
 * @returns {mixed|$.fn}
 */
$.fn.isDisabled =
    function() {
        return this[0].disabled || $(this).attr('disabled') ||
            $(this).attr('readonly');
    }

/**
 * @returns {mixed|$.fn}
 */
$.fn.disable = function(action) {
    if (action == null) action = true;
    if (action) {
        $(this).attr('disabled', 'disabled');
        $(this).attr('readonly', 'readonly');
    } else {
        $(this).removeAttr('disabled');
        $(this).removeAttr('readonly');
    }
}

/**
 * @returns {mixed|$.fn}
 */
$.fn.enable = function() {
    $(this).disable(false);
}

/**
 * @param options
 * @returns {boolean}
 */
$.fn.getFields =
    function(options) {
        options = options || {};
        var filter = options.filter || "*";
        var fields = [];
        $(this).find('[aria-required=true]').filter(filter)
            .each(
                function(i, e) {
                    if ($(this).attr('mask') == 'numerical' &&
                        $(this).val() > 0) fields.push(this);
                    else if ($(this).val() != null) {
                        if ($(this).val().trim().length > 0) fields.push(this);
                    }
                });
        return fields;
    }
