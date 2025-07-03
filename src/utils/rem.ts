const designWidth = 375;
const rootValue = 37.5; // 🤔 designWidth / 10 = 37.5

function setRem() {
  const scale = document.documentElement.clientWidth / designWidth;
  document.documentElement.style.fontSize = `${rootValue * Math.min(scale, 2)}px`;
}
setRem();
window.onresize = function () {
  setRem();
};