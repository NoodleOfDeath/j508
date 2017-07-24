/*******************************************************************************
 * Section508.js
 ******************************************************************************/

/*******************************************************************************
 * Constructor Methods
 ******************************************************************************/

/**
 * @returns {Section508}
 */
function Section508() {

}

/**
 * @param {integer} code
 * @param {string} message
 * @param {mixed} context
 * @param {boolean} fixed
 * @param {string} comments
 * @returns {Section508Violation}
 */
function Section508Violation(code, message, context, fixed, comments) {
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
 * Enumerated bitmask used to specify which rules to either run or output to the
 * console. Mainly for debug purposes.
 */
$.enumerate('Section508.Rule', {
    A_BlankTarget : null, //
    A_MissingTabindex : null, //
    A_MissingTitle : null, //
    Button_MissingTabindex : null,//
    Button_MissingTitle : null, //
    DataToggle_RestoreTitle : null, //
    TD_MissingScope : null, //
    TH_MissingScope : null, //
    All : 'MAX_VALUE',
}, true);

/**
 * String constants used by the Section508 API.
 */
Section508.Message =
    {

        A_BlankTarget : 'Adding missing sr-only element after blank target hyperlink. :: %O',
        A_MissingTabindex : 'Setting missing tabindex as 0 for hyperlink :: %O',
        A_MissingTitle : 'Setting missing title as "%s" for hyperlink :: %O',
        Button_MissingTabIndex : 'Setting missing tabindex as 0 for hyperlink :: %O',
        Button_MissingTitle : 'Setting missing title as "%s" for button :: %O',
        DataToggle_RestoreTitle : 'Restoring title as "%s" for data-toggle :: %O',
        TD_MissingScope : '',
        TH_MissingScope : '',

        WARNING_A_MissingTitle : 'WARNING: Unable to find an appropriate title for anonymous hyperlink. The title "%s" was used instead.',

    };

/**
 * Map that points a set of unique ids to the DOM elements that have the event
 * listener hooked to them
 */
Section508.hooks = {};

/**
 * Hooks the tab key to be confined only elements inside of a given
 * {@code element}.
 * 
 * @param {string} id - Id of this event listener which can be used to "unhook"
 *            it in the future.
 * @param {Element} element - Element in which to confine the tab index to.
 * @returns {void}
 */
Section508.hookTabIndex = function(id, element) {
    var elements = $(element).find(':enabled').sort(function(a, b) {
        return a.className < b.className;
    });
    if (elements.length < 1) { return; }
    this.hooks['keydown.Section508.tab.' + id] = elements.last();
    elements[0].focus();
    elements.last().bind('keydown.Section508.tab.' + id, function(e) {
        e = (e || window.event);
        var keyCode = (typeof e.which == 'number') ? e.which : e.keyCode;
        if (keyCode === 9) {
            e.preventDefault();
            var elements = $(element).find(':enabled').sort(function(a, b) {
                return a.className < b.className;
            })
            if (elements.length < 0) { return; }
            elements.first().focus();
        }
    });
}

/**
 * Unhooks the keypress event listener associated with {@code id}.
 * 
 * @param {string} id - Id of the event listener to unhook.
 * @returns {void}
 */
Section508.unhookTabIndex = function(id) {
    if (element = this.hooks['keydown.Section508.tab.' + id]) {
        $(element).off('keydown.Section508.tab.' + id);
    }
    delete this.hooks['keydown.Section508.tab.' + id];
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
 * is <code>Section508.Rule.ALL</code> which will run all 508 rules on the given
 * <code>node</code> argument passed as the second parameter.
 * </p>
 * <h5>Example</h>
 * <p>
 * <div class="code">
 * 
 * <pre>
 * Section508.makeCompliant($('document.body'), {
 *     rules : Section508.Rule.A_BlankTarget + Section508.Rule.Button_MissingTabindex,
 * });
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
 * <h5>Example</h>
 * <p>
 * <div class="code">
 * 
 * <pre>
 * Section508.makeCompliant('document.body', {
 *     debug : Section508.Rule.A_BlankTarget + Section508.Rule.Button_MissingTabindex,
 * });
 * </pre>
 * 
 * </div>
 * </p>
 * <h4>jQuery</h4>
 * <hr />
 * <p>
 * <code>Section508</code> can also be used in combinations with jQuery like in
 * the following example.
 * </p>
 * <h5>Example</h5>
 * <div class="code">
 * 
 * <pre>
 * $('document.body').make508Compliant();
 * $('document.body').make508Compliant({
 *     rules : Section508.Rule.Button_MissingTabindex,
 *     debug : Section508.Rule.All,
 * });
 * </pre>
 * 
 * </div> <style> .code { background: #f8f8f8; padding: 10px; } </style>
 * 
 * @param {mixed} node A DOM Node or string id.
 * @param {object} config Key-value configuration object.
 */
Section508.makeCompliant =
    function(node, config) {

        if (config == null) config = {};

        var violations = [];
        var loggedViolations = [];
        var failedViolations = []

        if (!($(node)[0] instanceof HTMLElement)) {
            config = node, node = null;
        }

        if (config.rules == null) config.rules = Section508.Rule.All;
        if (config.debug == null) config.debug = 0;

        function log(rule, message, node, fixed) {
            if (config.debug & rule) {
                loggedViolations.push(new Section508Violation(rule, message, node,
                    fixed));
                console.log(loggedViolations.length + '. ' + message, node);
            }
        }

        var target = node != null ? $(node) : $(document.body);

        if (config.rules & Section508.Rule.A_BlankTarget) {
            // Add title attribute to all a tags the open a new window.
            var targets = $('a[target=_blank]');
            targets.each(function(i, e) {
                var next = $(this).next();
                if (next.attr('class') == null
                    || next.attr('class').indexOf('sr-only') < 0) {
                    $(this).after($.build('span', {
                        html : '(link opens in a new tab)',
                        className : 'sr-only',
                    }));
                }
                var message = Section508.Message.A_BlankTarget;
                violations.push(new Section508Violation(Section508.Rule.A_BlankTarget,
                    message, this, true));
                log(Section508.Rule.A_BlankTarget, message, this, true);
            });
        }

        if (config.rules & Section508.Rule.A_MissingTabindex) {
            // Add a tabindex of 0 to any a element without one.
            var targets = $('a:not([tabindex])');
            targets.each(function(i, e) {
                $(this).attr('tabindex', '0');
                violations.push(new Section508Violation(
                    Section508.Rule.A_MissingTabindex));
                var message = Section508.Message.A_MissingTabindex;
                violations.push(new Section508Violation(
                    Section508.Rule.A_MissingTabindex, message, this, true));
                log(Section508.Rule.A_MissingTabindex, message, this, true);
            });
        }

        if (config.rules & Section508.Rule.A_MissingTitle) {
            // Add title attribute to all a elements without one.
            var targets = $('a:not([title])');
            targets.each(function(i, e) {
                var title, message, fixed = true;
                title = $(this).html().innerMostHTML();
                if (!title || title.trim() == '') title = $(this).attr('id');
                if (!title || title.trim() == '') title = $(this).attr('name');
                if (!title || title.trim() == '') {
                    fixed = false;
                    title = 'Anonymous hyperlink';
                    message =
                        Section508.Message.WARNING_A_MissingTitle.format(title);
                    failedViolations.push(new Section508Violation(
                        Section508.Rule.A_MissingTitle, message, this, fixed))
                } else {
                    message =
                        'Setting missing title as "' + title.trim()
                            + '" for hyperlink :: %O';
                }

                $(this).attr('title', title);

                violations.push(new Section508Violation(Section508.Rule.A_MissingTitle,
                    message, this, fixed));
                log(Section508.Rule.A_MissingTitle, message, this, fixed);

            });
        }

        if (config.rules & Section508.Rule.Button_MissingTabindex) {
            // Add a tabindex of 0 to any button element without one.
            var targets = $('button:not([tabindex])');
            targets.each(function(i, e) {
                $(this).attr('tabindex', '0');
                var message = 'Setting missing tabindex as 0 for button :: %O';
                violations.push(new Section508Violation(
                    Section508.Rule.Button_MissingTabindex, message, this, true));
                log(Section508.Rule.Button_MissingTabindex, message, this, true);
            });
        }

        if (config.rules & Section508.Rule.Button_MissingTitle) {
            // Add title attribute to all a button elements without one.
            var targets = $('button:not([title])');
            targets
                .each(function(i, e) {
                    var title = $(this).html().innerMostHTML().trim();
                    if (!title || title.trim() == '') return;
                    $(this).attr('title', title);
                    var message =
                        'Setting missing title as "' + title
                            + '" for button :: %O';
                    violations.push(new Section508Violation(
                        Section508.Rule.Button_MissingTitle, message, this, true));
                    log(Section508.Rule.Button_MissingTitle, message, this, true);
                });
        }

        if (config.rules & Section508.Rule.DataToggle_RestoreTitle) {
            // Re-add title attributes removed by Bootstrap data-toggle API.
            var targets = $('[data-original-title]');
            targets.each(function(i, e) {
                var title = $(this).attr('data-original-title');
                $(this).attr('title', title);
                var message =
                    'Restoring title as "' + title + '" for data-toggle :: %O';
                violations.push(new Section508Violation(
                    Section508.Rule.DataToggle_RestoreTitle, message, this, true));
                log(Section508.Rule.DataToggle_RestoreTitle, message, this, true);
            });
        }

        if (config.rules & Section508.Rule.TD_MissingScope) {
            // Add scope attribute for all td elements without one.
            var targets = $('tbody tr td:not([scope])');
            targets.each(function(i, e) {
                $(this).attr('scope', 'rowgroup');
                var message =
                    'Setting scope as "rowgroup" for table data-cell :: %O';
                violations.push(new Section508Violation(
                    Section508.Rule.TD_MissingScope, message, this, true));
                log(Section508.Rule.TD_MissingScope, message, this, true);
            });
        }

        if (config.rules & Section508.Rule.TH_MissingScope) {
            // Add scope attribute to all td elements without one.
            var targets = $('thead tr th:not([scope])');
            targets.each(function(i, e) {
                $(this).attr('scope', 'colgroup');
                var message =
                    'Setting scope as "colgroup" for table header :: %O';
                violations.push(new Section508Violation(
                    Section508.Rule.TH_MissingScope, message, this, true));
                log(Section508.Rule.TH_MissingScope, message, this, true);
            });
        }

        if (config.debug > 0) {
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

/*******************************************************************************
 * jQuery Extensions
 ******************************************************************************/

/**
 * Short hand for <code>Section508.makeCompliant(this, config)</code>.
 * 
 * @param {object} config
 */
$.fn.make508Compliant = function(config) {
    Section508.makeCompliant(this, config);
}
