import {useState,useRef,useEffect,useLayoutEffect} from 'react';

/*
  useResizeEffect
    gets size of element on render and refreshes on window resize
*/
export function useResizeEffect(onResize) {
  const outerRef = useRef(null);
  const resizeListener = () => {
    if (outerRef.current) {
      onResize({
        width: outerRef.current.clientWidth,
        height: outerRef.current.clientHeight,
      });
    }
  };
  useEffect(() => {
    window.addEventListener('resize', resizeListener, false);
    return function cleanup() {
      window.removeEventListener('resize', resizeListener);
    };
  });
  useLayoutEffect(() => {
    if (outerRef.current) {
      resizeListener();
    }
  });
  return [outerRef];
}
