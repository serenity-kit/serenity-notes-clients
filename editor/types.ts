import { Node as ProseMirrorNode } from "prosemirror-model";

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

export type Predicate = (node: ProseMirrorNode) => boolean;

export type NodeRange = {
  node: ProseMirrorNode;
  from: number;
  to: number;
};
