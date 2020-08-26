import {
  getComputedStyle,
  querySelector,
} from '../utils';
import './index.css';

let renderTimer = null;
let cacheData = [];
const WRAP_NUM_SPAN_CLASS = '__tracker-num-span-wrap__';
const NUM_SPAN_CLASS = '__tracker-num-span__';
const ignoreTag = ['tr'];

/**
 * 渲染数字图
 * @param {*} data 
 */
const renderNumMap = (data = []) => {
  clearNumMap();
  for (let i = 0; i < data.length; i++) {
    const domPath = data[i].domPath;
    let target;
    try {
      target = querySelector(decodeURIComponent(domPath));
    } catch (err) {
      target = null;
      console.log(`error: querySelector ${decodeURIComponent(domPath)} error`);
    }
    if (!target) {
      continue;
    }
    if (target.classList.contains(WRAP_NUM_SPAN_CLASS)) {
      continue;
    }
    if (ignoreTag.indexOf(target.tagName.toLowerCase()) >= 0) {
      continue;
    }
    const numSpan = document.createElement('span');
    numSpan.innerHTML = `${data[i].pv}`;
    numSpan.classList.add(NUM_SPAN_CLASS);
    target.appendChild(numSpan)
    const style = getComputedStyle(target)
    if (style.position != 'absolute') {
      target.classList.add(WRAP_NUM_SPAN_CLASS)
    }
  }
}

/**
 * 防抖动渲染
 */
const debounceRender = () => {
  if (renderTimer) {
    clearTimeout(renderTimer);
    renderTimer = null;
  }

  renderTimer = setTimeout(() => {
    renderNumMap(cacheData);
  }, 300);
}

/**
 * 清除页面已渲染的数字图
 */
const clearNumMap = () => {
  const numSpanList = document.querySelectorAll(`.${NUM_SPAN_CLASS}`) || [];
  for (let i = 0; i < numSpanList.length; i++) {
    numSpanList[i].parentNode.removeChild(numSpanList[i]);
  }
}

/**
 * 渲染主函数
 * @param {*} data 
 */
const render = (data) => {
  if (data) {
    cacheData = data;
    window.scrollTo(0, 0);
  }
  renderNumMap(cacheData);
  window.onresize = debounceRender;
}

export default render;
