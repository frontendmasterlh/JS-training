/**
 * 单个商品的数据
 */
class UIGood {
  constructor(g) {
    this.data = g;
    this.choose = 0;
  }
  /**
   * 获取商品的总价
   * @returns {number}
   */
  getGoodToalPrice() {
    return this.data.price * this.choose;
  }
  /**
   * 是否选中了商品
   */
  isGoodChoose() {
    return this.choose > 0;
  }
  increase() {
    this.choose++;
  }
  decrease() {
    if (this.choose === 0) {
      return;
    }
    this.choose--;
  }
}

/**
 * 整个界面的数据
 */
class UIData {
  constructor() {
    this.uiGoods = goods.map((good) => new UIGood(good));
    // 配送起步费
    this.deliveryThreshold = 30;
    this.deliveryPrice = 5;
  }
  /**
   * 所有商品的总价
   * @returns {number}
   */
  getTotalPrice() {
    return this.uiGoods.reduce((totalPrice, good) => {
      return totalPrice + good.getGoodToalPrice();
    }, 0);
  }
  /**
   * 增加某件商品的选中数量
   */
  increase(index) {
    this.uiGoods[index].increase();
  }
  /**
   * 减少某件商品的选中数量
   */
  decrease(index) {
    this.uiGoods[index].decrease();
  }
  /**
   * 获取购物车里选中的总数量
   */
  getTotalChooseNumbers() {
    return this.uiGoods.reduce((total, good) => total + good.choose, 0);
  }
  /**
   * 购物车有没有商品
   */
  hasGoodsInCart() {
    return this.getTotalChooseNumbers() > 0;
  }
  /**
   * 是否跨越了配送费
   */
  isCrossDeliveryThreshold() {
    return this.getTotalPrice() >= this.deliveryThreshold;
  }

  isChoose(index) {
    return this.uiGoods[index].isGoodChoose();
  }
}

/**
 * 整个界面
 */
class UI {
  constructor() {
    this.uiData = new UIData();
    this.doms = {
      goodsContainer: document.querySelector(".goods-list"),
      deliveryPrice: document.querySelector(".footer-car-tip"),
      footerPay: document.querySelector(".footer-pay"),
      footerPayInnerSpan: document.querySelector(".footer-pay span"),
      totalPrice: document.querySelector(".footer-car-total"),
      car: document.querySelector(".footer-car"),
      badge: document.querySelector(".footer-car-badge"),
    };

    var carRect = this.doms.car.getBoundingClientRect();

    var jumpTarget = {
      x: carRect.left + carRect.width / 2,
      y: carRect.top + carRect.height / 5,
    };
    this.jumpTarget = jumpTarget;

    this.createHTML();
    this.updateFooter();
    this.listenEvent();
  }

  /**
   * 监听各种事件
   */
  listenEvent() {
    this.doms.car.addEventListener("animationend", function () {
      this.classList.remove("animate");
    });
  }
  /**
   * 根据商品数量创建商品列表
   */
  createHTML() {
    var html = "";
    for (var i = 0; i < this.uiData.uiGoods.length; i++) {
      var g = this.uiData.uiGoods[i];
      html += `<div class="goods-item">
      <img src="${g.data.pic}" alt="" class="goods-pic">
      <div class="goods-info">
        <h2 class="goods-title">${g.data.title}</h2>
        <p class="goods-desc">${g.data.desc}</p>
        <p class="goods-sell">
          <span>月售 ${g.data.sellNumber}</span>
          <span>好评率${g.data.favorRate}%</span>
        </p>
        <div class="goods-confirm">
          <p class="goods-price">
            <span class="goods-price-unit">￥</span>
            <span>${g.data.price}</span>
          </p>
          <div class="goods-btns">
            <i index="${i}" class="iconfont i-jianhao"></i>
            <span>${g.choose}</span>
            <i index="${i}" class="iconfont i-jiajianzujianjiahao"></i>
          </div>
        </div>
      </div>
    </div>`;
    }
    this.doms.goodsContainer.innerHTML = html;
  }

  increase(index) {
    this.uiData.increase(index);
    this.updateGoodItem(index);
    this.updateFooter();
    this.jump(index);
  }
  decrease(index) {
    this.uiData.decrease(index);
    this.updateGoodItem(index);
    this.updateFooter();
  }

  /**
   * 更新某个商品元素的显示状态
   * @param {number} index
   */
  updateGoodItem(index) {
    var goodDom = this.doms.goodsContainer.children[index];
    if (this.uiData.isChoose(index)) {
      goodDom.classList.add("active");
    } else {
      goodDom.classList.remove("active");
    }
    var span = goodDom.querySelector(".goods-btns span");
    span.textContent = this.uiData.uiGoods[index].choose;
  }
  /**
   * 更新页脚显示状态
   */
  updateFooter() {
    // 得到总价数据
    var total = this.uiData.getTotalPrice();
    // 设置配送费
    this.doms.deliveryPrice.textContent = `配送费￥${this.uiData.deliveryPrice}`;
    // 设置起送费还差多少
    if (this.uiData.isCrossDeliveryThreshold()) {
      this.doms.footerPay.classList.add("active");
    } else {
      this.doms.footerPay.classList.remove("active");
      var dis = this.uiData.deliveryThreshold - total;
      dis = Math.round(dis);
      this.doms.footerPayInnerSpan.textContent = `还差￥${dis}元起送`;
    }
    // 设置总价
    this.doms.totalPrice.textContent = total.toFixed(2);
    // 设置购物车的样式状态
    if (this.uiData.hasGoodsInCart()) {
      this.doms.car.classList.add("active");
    } else {
      this.doms.car.classList.remove("active");
    }
    // 设置购物车中的数量
    this.doms.badge.textContent = this.uiData.getTotalChooseNumbers();
  }

  /**
   * 购物车动画
   */
  carAnimate() {
    this.doms.car.classList.add("animate");
  }

  /**
   * 抛物线跳跃的元素
   * @param {number} index
   */
  jump(index) {
    // 计算起始位置 和 结束位置
    // 找到对应商品的加号
    var btnAdd = this.doms.goodsContainer.children[index].querySelector(
      ".i-jiajianzujianjiahao"
    );
    var rect = btnAdd.getBoundingClientRect();
    var start = {
      x: rect.left,
      y: rect.top,
    };
    // 跳吧
    var div = document.createElement("div");
    div.className = "add-to-car";
    var i = document.createElement("i");
    i.className = "iconfont i-jiajianzujianjiahao";
    // 设置初始位置
    div.style.transform = `translateX(${start.x}px)`;
    i.style.transform = `translateY(${start.y}px)`;
    // div.style.backgroundColor = "red";
    div.appendChild(i);
    document.body.appendChild(div);

    // 强行渲染
    div.clientWidth;

    // 设置结束位置
    div.style.transform = `translateX(${this.jumpTarget.x}px)`;
    i.style.transform = `translateY(${this.jumpTarget.y}px)`;
    div.addEventListener(
      "transitionend",
      () => {
        div.remove();
        this.carAnimate();
      },
      {
        once: true, // 事件仅触发一次
      }
    );
  }
}

var ui = new UI();
// 事件
ui.doms.goodsContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("i-jiajianzujianjiahao")) {
    var index = +e.target.getAttribute("index");
    ui.increase(index);
  } else if (e.target.classList.contains("i-jianhao")) {
    var index = +e.target.getAttribute("index");
    ui.decrease(index);
  }
});
