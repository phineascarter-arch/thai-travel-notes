export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DockOffset {
  x: number;
  y: number;
  scale: number;
}

// 算「唱片飛到撥放器轉盤上」要套用的 CSS transform：兩個矩形中心點的
// 位移量，加上讓唱片視覺尺寸貼合轉盤大小的縮放比例。source/target 用
// 結構相容的普通物件（不是真的 DOMRect），呼叫端可以直接傳
// getBoundingClientRect() 的結果，也方便在這裡寫不需要瀏覽器 DOM 的
// 單元測試。
export function computeDockOffset(source: Rect, target: Rect): DockOffset {
  const sourceCenterX = source.left + source.width / 2;
  const sourceCenterY = source.top + source.height / 2;
  const targetCenterX = target.left + target.width / 2;
  const targetCenterY = target.top + target.height / 2;
  return {
    x: targetCenterX - sourceCenterX,
    y: targetCenterY - sourceCenterY,
    scale: target.width / source.width,
  };
}
