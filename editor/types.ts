declare global {
  interface Window {
    isDesktop: boolean;
  }
}

export type HeadingAttrs = {
  level?: 2 | 3;
  ychange: null;
};
