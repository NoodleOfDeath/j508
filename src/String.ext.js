/*******************************************************************************
 * String.ext.js
 ******************************************************************************/

/**
 * @returns {string}
 */
String.prototype.innerMostHTML = function() {
    return this.replace(/<.*?>/g, '').replace(/\s\s+/g, ' ');
}

String.prototype.format = function(...args) {
    var str = this.substring(0);
    for (var i in args) {
        var arg = args[i];
        switch (typeof arg) {
        
        case 'object':
            str = str.replace(/%o/i, arg);
            break;
        
        case 'number':
            str = str.replace(/%d/i, arg);
            break;
            
        case 'string':
        default:
            str = str.replace(/%s/i, arg);
            break;
        
        }
    }
    return str;
}