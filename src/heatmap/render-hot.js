import heatMap from './heatmap.js';
import {
  getBoundingClientRect,
  getComputedStyle,
  querySelector,
} from '../utils';
import './index.css';

let heatmap = null;
let renderTimer = null;
let cacheData = [];
const CANVAS_WRAP_ID = '__tracker_heat_map__';

/**
 * 获取原始的点击坐标
 * @param {*} data 
 */
const getOriginPoints = (data = []) => {
  const points = [];
  let max = 0;
  for (let i = 0; i < data.length; i++) {
    const domPath = data[i].domPath;
    if (!domPath || !data[i].pv) {
      continue;
    }
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
    const rect = getBoundingClientRect(target);
    let x = parseInt(data[i].offsetX * rect.width + rect.left, 10);
    let y = parseInt(data[i].offsetY * rect.height + rect.top, 10);
    let value = data[i].pv;
    if (!value) {
      continue;
    }
    const point = {
      x,
      y,
      value,
    };
    points.push(point);
    max = Math.max(max, value);
  }
  return {
    points,
    max,
  };
}

/**
 * 渲染热力图
 * @param {*} data 
 */
const renderHeatMap = (data = []) => {
  const pointsData = getOriginPoints(data);
  if (!heatmap) {
    const canvasWrap = document.createElement('div');
    canvasWrap.id = CANVAS_WRAP_ID;
    document.body.appendChild(canvasWrap);
    heatmap = heatMap.create({
      radius: 40,
      container: canvasWrap,
    });
    heatmap.setData({
      max: pointsData.max,
      data: pointsData.points,
    });
  } else {
    heatmap._renderer._clear();
    const canvasWrap = document.getElementById(CANVAS_WRAP_ID);
    const canvasWrapStyles = getComputedStyle(canvasWrap);
    const canvasWrapWidth = +canvasWrapStyles.width.replace(/px/, '');
    const canvasWrapHeight = +canvasWrapStyles.height.replace(/px/, '');
    heatmap._renderer.setDimensions(canvasWrapWidth, canvasWrapHeight);
    heatmap.setData({
      max: pointsData.max,
      data: pointsData.points,
    });
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
    renderHeatMap(cacheData);
  }, 200);
}

/**
 * 清除页面已渲染的热力图
 */
const clearHeatMap = () => {
  const canvasWrap = document.getElementById(CANVAS_WRAP_ID);
  if (canvasWrap) {
    canvasWrap.parentNode.removeChild(canvasWrap);
  }
  heatmap = null;
}

/**
 * 渲染主函数
 * @param {*} data 
 */
const render = (data) => {
  clearHeatMap();
  if (data) {
    cacheData = data;
    window.scrollTo(0, 0);
  }
  renderHeatMap(cacheData);
  window.onscroll = debounceRender;
  window.onmousewheel = debounceRender;
  window.onresize = debounceRender;
}

export default render;
