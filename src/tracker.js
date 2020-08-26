import { version } from '../package.json';
import {
  getUniqueId,
  getEvent,
  getEventListenerMethod,
  getBoundingClientRect,
  getUrlQuery,
  jsonp,
  stringify,
  getDomPath,
} from './utils'
import renderHotMap from './heatmap/render-hot';
import renderNumMap from './heatmap/render-num';

// 默认配置，例如监听的事件、上报参数等
const DefaultOptions = {
  useClass: false, //获取domPath的时候是否使用class，比如：div.red
  per: 0.01, //上报频率
  server: '//xx.com/kvcollect', //上报服务器
  events: ['click'], //需要监听的事件
  content: {
    page: '', //页面URL，暂时无用
    url: '', //页面URL
    pageType: '',   //页面类型，主要用在SPA中
    trackingType: 'pageload', //上报事件类型，默认为页面加载完成
    iQQ: getUniqueId({ preferNumber: true }),
    sQQ: getUniqueId({ preferNumber: false }),
  }, //默认上报的内容
};

/**
 * @class Tracker
 * @classdesc 无痕埋点发送端工具库
 */
class Tracker {
  constructor() {
    // 版本号
    this.version = version,
      // 是否安装
      this._isInstall = false;
    // 禁止发送
    this._disableSend = false;
    // 配置选项
    this._options = {};
  }

  /**
   * 初始化配置
   * @param {*} options 
   */
  config(options = {}) {
    options = {
      ...DefaultOptions,
      ...options,
    };
    if (!options.BossId || !options.Pwd) {
      throw new Error('BossId或者Pwd不能为空!');
    }
    if (!options.appKey) {
      throw new Error('项目Key不能为空!');
    }
    options.event = DefaultOptions.event; // 暂时只支持click事件
    this._options = options;
    return this;
  }

  /**
   * 设置上报内容，比如可以用在SPA中，当路由改变时，可以设置当前需要上报的内容
   * @param {*} data 
   */
  setContent(data) {
    const content = this._options.content || {};
    this._options.content = {
      ...content,
      ...data,
    };
    return this;
  }

  /**
   * 在document上监听options.events中配置的事件
   */
  _captureEvents() {
    const self = this;
    const events = this._options.events;
    const eventMethodObj = getEventListenerMethod();
    for (let i = 0, j = events.length; i < j; i++) {
      let eventName = events[i];
      document.body[eventMethodObj.addMethod](eventMethodObj.prefix + eventName, function (event) {
        const eventFix = getEvent(event);
        if (!eventFix) {
          return;
        }
        self._handleEvent(eventFix);
      }, false)
    }
  }

  /**
   * 对事件分析，获取相关数据并上报
   * @param {*} event 
   */
  _handleEvent(event) {
    const { href } = document.location;
    const showHeatMap = getUrlQuery(href, 'showHeatMap');
    const showNumMap = getUrlQuery(href, 'showNumMap');
    if (showHeatMap || showNumMap) {
      return;
    }
    const per = parseFloat(this._options.per);
    if (!this.hit(per)) {
      return;
    }
    let domPath;
    try {
      domPath = getDomPath(event.target, this._options.useClass);
    } catch (err) {
      domPath = '';
      console.warn(`get domPath error: ${err}`);
    }
    if (!domPath) {
      return;
    }
    if (domPath.length > 256) {
      return;
    }
    const rect = getBoundingClientRect(event.target);
    if (rect.width == 0 || rect.height == 0) {
      return;
    }
    let t = document.documentElement || document.body.parentNode;
    const scrollX = (t && typeof t.scrollLeft == 'number' ? t : document.body).scrollLeft;
    const scrollY = (t && typeof t.scrollTop == 'number' ? t : document.body).scrollTop;
    const pageX = event.pageX || event.clientX + scrollX;
    const pageY = event.pageY || event.clientY + scrollY;
    const data = {
      domPath: encodeURIComponent(encodeURIComponent(domPath)), // 元素dom路径
      trackingType: event.type,
      offsetX: ((pageX - rect.left - scrollX) / rect.width).toFixed(6), // 鼠标点击位置相对于目标元素左上角的x轴偏移率
      offsetY: ((pageY - rect.top - scrollY) / rect.height).toFixed(6), // 鼠标点击位置相对于目标元素左上角的y轴偏移率
    };
    this.send(data);
  }

  /**
   * 渲染热力图 & 数字图
   */
  _renderMap() {
    const { href } = document.location;
    const showHeatMap = getUrlQuery(href, 'showHeatMap');
    const showNumMap = getUrlQuery(href, 'showNumMap');
    const beginDate = getUrlQuery(href, 'beginDate');
    const endDate = getUrlQuery(href, 'endDate');
    if (!showHeatMap && !showNumMap) {
      return;
    }
    const url = 'http://xx.com/api/hotlist/trackers';
    window.setTimeout(() => {
      jsonp(url, {
        data: {
          url: encodeURIComponent(href.split('?')[0]),
          appKey: this._options.appKey,
          beginDate: beginDate,
          endDate: endDate,
        }
      }, function (err, data) {
        if (!err) {
          showHeatMap && renderHotMap((data && data.data && data.data.heatMap) || []);
          showNumMap && renderNumMap((data && data.data && data.data.numMap) || []);
        }
      });
    }, 3000)
  }

  /**
   * 上报数据
   * @param {*} data 
   */
  send(data = {}) {
    if (!this._isInstall || this._disableSend) {
      return;
    }
    const content = this._options.content || {};
    data = {
      ...content,
      ...data,
    };
    const { href } = document.location;
    data.url = encodeURIComponent(data.url || href.split('?')[0]);
    const sendData = {
      ...data,
      appKey: this._options.appKey,
      BossId: this._options.BossId,
      Pwd: this._options.Pwd,
      _dc: Math.random(),
    };
    if (this._options.debug) {
      console.log(`[Tracker Info]: ${stringify(sendData)}`);
      return;
    }
    let image = new Image(1, 1);
    image.onload = function () {
      image = null;
    };
    image.src = `${this._options.server}?${stringify(sendData)}`;
  }

  /**
   * 抽样上报
   */
  hit(per = 0.01) {
    return Math.random() < per;
  }

  /**
   * 禁止上报
   */
  disableSend() {
    this._disableSend = true;
  }

  /**
   * 允许上报
   */
  enableSend() {
    this._disableSend = false;
  }

  /**
   * 安装Tracker
   */
  install() {
    if (this._isInstall) {
      return this;
    }
    this._captureEvents();
    this._renderMap();
    this._isInstall = true;
    return this;
  }
}

export default Tracker;
