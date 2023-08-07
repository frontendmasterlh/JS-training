// ----------------数据逻辑-----------------------
/**
 * 解析歌词字符串,得到一个歌词对象的数组
 * 每个歌词对象: {time: 开始时间, words: 歌词内容}
 * @returns {Array}
 */
function parseLrc() {
  var lines = lrc.split("\n");
  var results = []; // 歌词数组
  lines.forEach((line) => {
    var parts = line.split("]");
    var timeStr = parts[0].substring(1);

    var obj = {
      time: parseTime(timeStr),
      words: parts[1],
    };
    results.push(obj);
  });
  return results;
}

/**
 * 将一个时间字符串解析为数字(秒)
 * @param {String} timeStr 时间字符串
 * @returns Number
 */
function parseTime(timeStr) {
  var parts = timeStr.split(":");
  return +parts[0] * 60 + +parts[1];
}

/**
 * 计算在当前播放器播放到第几秒的情况下
 * lrcData数组中,应该高亮显示的歌词下标
 * @returns {Number}
 */
function findIndex() {
  var curTime = doms.audio.currentTime;

  var index = lrcData.findIndex((item, index) => {
    if (item.time > curTime) {
      return true;
    }
  });

  // 找遍了都没有找到(说明播放到了最后一句)
  if (index === -1) {
    index = lrcData.length - 1;
  } else {
    index = index - 1;
  }

  return index;
}

// ---------------界面逻辑-----------------------
/**
 * 创建歌词元素 li
 */
function createLrcElements() {
  var fragment = document.createDocumentFragment();
  lrcData.forEach((lrc) => {
    var li = document.createElement("li");
    li.textContent = lrc.words;
    fragment.appendChild(li);
  });
  doms.ul.appendChild(fragment);
}

/**
 * 设置ul元素的偏移量
 */
function setOffset() {
  var index = findIndex();
  var offset = liHeight * index + liHeight / 2 - containerHeight / 2;
  if (offset < 0) {
    offset = 0;
  } else if (offset > maxHeight) {
    offset = maxHeight;
  }
  // 去掉之前的active样式
  var li = document.querySelector("li.active");
  if (li) {
    li.classList.remove("active");
  }
  li = doms.ul.children[index];
  if (li) {
    doms.ul.children[index].classList.add("active");
  }
  doms.ul.style.transform = `translateY(-${offset}px)`;
}
// 获取需要操作的dom
var doms = {
  audio: document.querySelector("audio"),
  ul: document.querySelector(".container ul"),
  container: document.querySelector(".container"),
};

var lrcData = parseLrc();
createLrcElements();

// 容器高度, li高度, 最大偏移高度
var containerHeight = doms.container.clientHeight;
var liHeight = doms.ul.children[0].clientHeight;
var maxHeight = doms.ul.clientHeight - containerHeight;

doms.audio.addEventListener("timeupdate", setOffset);
