type ReactNativeWebView = {
  postMessage: (message: string) => void;
};

declare global {
  interface Window {
    isDesktop: boolean;
    ReactNativeWebView: ReactNativeWebView;
    ydoc: any;
  }
}

export type HeadingAttrs = {
  level?: 2 | 3;
  ychange: null;
};
