import extend from 'extend';

/**
 * 获取url中的参数
 * @param {*} url 
 * @param {*} name 
 */
export const getUrlQuery = (url, name) => {
    url = url.replace(/&amp;/g, "&");
    let startIndex = url.indexOf('#');
    // let startIndex = -1;
    let returnObject = {};
    if (url.indexOf('?') > -1 && startIndex > -1) {
        startIndex = Math.min(url.indexOf('?'), url.indexOf('#'));
    } else if (url.indexOf('?') > -1) {
        startIndex = url.indexOf('?');
    }
    if (startIndex > -1) {
        url = url.substring(startIndex + 1);
        url = url.replace(/#/g, '&');
        url = url.replace(/\?/g, '&');
        let params = url.split('&');
        for (let i = 0,
            len = params.length,
            pname = null,
            pvalue = null
            ; i < len; i++) {
            // pname = params[i].split('=')[0].toLowerCase();
            pname = params[i].split('=')[0];
            pvalue = params[i].substring(params[i].indexOf('=') + 1);
            pname = pname.indexOf('%u') > -1 ? unescape(pname) : pname;
            pvalue = pvalue.indexOf('%u') > -1 ? unescape(pvalue) : pvalue;
            returnObject[pname] = pvalue;
        };
        returnObject.hasUrlParams = '1';
    }
    if (name) {
        return returnObject && returnObject[name];
    }
    return returnObject;
}

function getCookie (name) {
    let nameEQ = encodeURIComponent(name) + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

/**
 * 获取登陆用户QQ号
 * @param {*} param0
 * @returns {number} QQ 
 */
export const getQQ = ({ isNumber = false } = {}) => {
    const qqUin = getCookie('uin');
    if (!qqUin) {
        return null;
    }
    if (isNumber) {
        const numedStr = Number(qqUin.replace(/^[o0]*/gi, ''));
        if (!numedStr) {
            return null;
        }
        return numedStr;
    }
    return qqUin;
};

/**
 * 获取微信OpenID
 */
export const getOpenId = () => {
    let openid = getUrlQuery(window.location.search, 'openid')
    return openid;
};

/**
 * 获取唯一ID，可以是微信OpenID、QQ号
 * @param {*} param0 
 */
export const getUniqueId = ({ preferNumber = false } = {}) => getOpenId() || getQQ({ isNumber: preferNumber });

/**
 * 获取针对IE修复后的event对象
 * @param {*} event 
 */
export const getEvent = (event) => {
    event = event || window.event;
    if (!event) {
        return event;
    }
    if (!event.target) {
        event.target = event.srcElement;
    }
    if (!event.currentTarget) {
        event.currentTarget = event.srcElement;
    }
    return event;
}

/**
 * 获取针对IE修复后的事件监听方法以及事件前缀
 */
export const getEventListenerMethod = () => {
    let addMethod = 'addEventListener', removeMethod = 'removeEventListener', prefix = '';
    if (!window.addEventListener) {
        addMethod = 'attachEvent';
        removeMethod = 'detachEvent';
        prefix = 'on';
    }
    return {
        addMethod,
        removeMethod,
        prefix,
    }
}

/**
 * 获取元素element的bounding信息
 * @param {*} element 
 */
export const getBoundingClientRect = (element) => {
    const rect = element.getBoundingClientRect();
    const width = rect.width || rect.right - rect.left;
    const heigth = rect.heigth || rect.bottom - rect.top;
    return extend({}, rect, {
        width,
        heigth,
    });
}

let count = 0;
function noop() { }

/**
 * jsonp
 * @param {*} url 
 * @param {*} opts 
 * @param {*} fn 
 */
export const jsonp = (url, opts, fn) => {
    if ('function' == typeof opts) {
        fn = opts;
        opts = {};
    }
    if (!opts) opts = {};

    let prefix = opts.prefix || '__jp';

    // use the callback name that was passed if one was provided.
    // otherwise generate a unique name by incrementing our counter.
    let id = opts.name || (prefix + (count++));

    let param = opts.param || 'callback';
    let data = opts.data || {};
    let timeout = null != opts.timeout ? opts.timeout : 60000;
    let enc = encodeURIComponent;
    let target = document.getElementsByTagName('script')[0] || document.head;
    let script;
    let timer;


    if (timeout) {
        timer = setTimeout(function () {
            cleanup();
            if (fn) fn(new Error('Timeout'));
        }, timeout);
    }

    function cleanup() {
        if (script.parentNode) script.parentNode.removeChild(script);
        window[id] = noop;
        if (timer) clearTimeout(timer);
    }

    function cancel() {
        if (window[id]) {
            cleanup();
        }
    }

    window[id] = function (data) {
        cleanup();
        if (fn) fn(null, data);
    };

    // add qs component
    url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
    for (let x in data) {
        if (data[x] !== undefined) {
            url += `&${x}=${data[x]}`;
        }
    }
    url = url.replace('?&', '?');

    // create script
    script = document.createElement('script');
    script.src = url;
    target.parentNode.insertBefore(script, target);

    return cancel;
}

/**
 * stringify
 * @param {*} obj 
 */
export const stringify = (obj) => {
    let params = [];
    for (let key in obj) {
        params.push(`${key}=${obj[key]}`);
    }
    return params.join('&');
}

/**
 * getComputedStyle
 * @param {*} element 
 * currentStyle:该属性只兼容IE,不兼容火狐和谷歌
 * getComputedStyle:该属性是兼容火狐谷歌,不兼容IE
 */
export function getComputedStyle(element) {
    return element.currentStyle ? element.currentStyle : window.getComputedStyle(element, null);
}

/**
 * getDomPath
 * 根据dom元素获取domPath, 如: body>div>input.red[type="radio"]:nth-child(2)
 * @param {*} element 
 * @param {*} useClass 
 */
export function getDomPath(element, useClass = false) {
    if (!(element instanceof HTMLElement)) {
        console.warn('input is not a HTML element!');
        return '';
    }
    let domPath = [];
    let elem = element;
    while(elem) {
        let domDesc = getDomDesc(elem, useClass);
        if (!domDesc) {
            break;
        }
        domPath.unshift(domDesc);
        if (querySelector(domPath.join('>')) === element || domDesc.indexOf('body') >= 0) {
            break;
        }
        domPath.shift();
        const children = elem.parentNode.children;
        if (children.length > 1) {
            for (let i = 0; i < children.length; i++) {
                if (children[i] === elem) {
                    domDesc += `:nth-child(${i + 1})`;
                    break;
                }
            }
        }
        domPath.unshift(domDesc);
        if (querySelector(domPath.join('>')) === element) {
            break;
        }
        elem = elem.parentNode;
    }
    return domPath.join('>');
}

/**
 * getDomDesc
 * 根据dom元素获取该元素的描述信息, 如: input.red[type="radio"]
 * @param {*} element 
 * @param {*} useClass 
 */
export function getDomDesc(element, useClass = false) {
    const domDesc = [];
    if (!element || !element.tagName) {
        return '';
    }
    if (element.id) {
        return `#${element.id}`;
    }
    domDesc.push(element.tagName.toLowerCase());
    if (useClass) {
        const className = element.className;
        if (className && typeof className === 'string') {
            const classes = className.split(/\s+/);
            domDesc.push(`.${classes.join('.')}`);
        }
    }
    if (element.name) {
        domDesc.push(`[name=${element.name}]`);
    }
    // if (element.type) {
    //     domDesc.push(`[type=${element.type}]`);
    // }
    return domDesc.join('');
}

/**
 * querySelector
 * 根据domPath获取dom元素
 * @param {*} queryString 
 */
export function querySelector(queryString) {
    return document.getElementById(queryString) || document.getElementsByName(queryString)[0] || document.querySelector(queryString);
}
