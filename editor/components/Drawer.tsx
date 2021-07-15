// inspired by https://codesandbox.io/s/zuwji?file=/src/index.js

import React, { useRef, useCallback } from "react";
import { useSpring, animated, config } from "@react-spring/web";
import { useDrag } from "react-use-gesture";
import Portal from "@reach/portal";
import useOnClickOutside from "use-onclickoutside";
import { EditorView } from "prosemirror-view";
import * as theme from "../theme";
import { useEffect } from "react";
import uniqueId from "../utils/uniqueId";
import { getActiveDrawer } from "../utils/toolbarState";

type ButtonProps = {
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>;
};

type RenderProps = {
  onPointerDownClose: React.PointerEventHandler<HTMLButtonElement>;
  close: () => void;
};

type Props = {
  children: (renderProps: RenderProps) => React.ReactNode;
  button: (props: ButtonProps) => JSX.Element;
  height: Number;
  onClose?: (uniqueDrawerId: string) => void;
  onOpen?: (uniqueDrawerId: string) => void;
  editorView: EditorView;
};

let proseMirror: Element | undefined;
let allDrawerCloseFunctions: Record<string, () => void> = {};

function getDrawerCloseFunctionsWithoutCurrent(id: string) {
  return Object.keys(allDrawerCloseFunctions)
    .filter((key) => key !== id)
    .map((key) => allDrawerCloseFunctions[key]);
}

function shouldIgnoreDragging(target: EventTarget) {
  const ignoreDraggingElements = document.querySelectorAll(
    "[data-serenity-ignore-drawer-dragging]"
  );
  return Array.from(ignoreDraggingElements).some((element) =>
    element.contains(target)
  );
}

export default function Drawer({
  children,
  height,
  onClose,
  onOpen,
  button,
  editorView,
}: Props) {
  const Button = button;
  const isOpenRef = useRef(false);
  const drawerRef = useRef(null);
  const uniqueDrawerIdRef = useRef(uniqueId());

  const [{ y }, set] = useSpring(() => ({
    y: height,
    onChange: (event) => {
      if (!proseMirror) {
        proseMirror = document.getElementsByClassName("ProseMirror")[0];
      }
      const offset = +height - event.value.y;
      const finalOffset = Math.max(53, offset);
      // @ts-expect-error style is available
      proseMirror.style.height = `calc(100vh - ${finalOffset}px)`;
      editorView.dispatch(editorView.state.tr.scrollIntoView());
    },
  }));

  const open = ({ canceled }: { canceled: boolean }) => {
    isOpenRef.current = true;
    // when cancel is true, it means that the user passed the upwards threshold
    // so we change the spring config to create a nice wobbly effect
    set({
      y: 0,
      immediate: false,
      config: canceled ? config.wobbly : config.default,
    });
    if (onOpen) {
      onOpen(uniqueDrawerIdRef.current);
    }
  };
  const close = (velocity = 0) => {
    // already closed
    if (isOpenRef.current === false) return;

    isOpenRef.current = false;
    set({
      y: height,
      immediate: false,
      config: { ...config.default, velocity },
    });
    if (onClose) {
      onClose(uniqueDrawerIdRef.current);
    }
  };

  useOnClickOutside(drawerRef, () => {
    close();
  });

  const closeOnEditorBlur = useCallback(() => {
    // prevent a close if the current drawer should stay open
    if (getActiveDrawer() === uniqueDrawerIdRef.current) return;
    close();
  }, []);

  useEffect(() => {
    if (!proseMirror) {
      proseMirror = document.getElementsByClassName("ProseMirror")[0];
    }
    proseMirror.addEventListener("blur", closeOnEditorBlur);

    return () => {
      if (proseMirror) {
        proseMirror.removeEventListener("blur", closeOnEditorBlur);
      }
    };
  }, [closeOnEditorBlur]);

  useEffect(() => {
    allDrawerCloseFunctions[uniqueDrawerIdRef.current] = close;
    return () => {
      delete allDrawerCloseFunctions[uniqueDrawerIdRef.current];
    };
  });

  const bind = useDrag(
    ({ last, vxvy: [, vy], movement: [, my], cancel, canceled }) => {
      // if the user drags up passed a threshold, then we cancel
      // the drag so that the sheet resets to its open position
      if (my < -70) cancel();

      // when the user releases the sheet, we check whether it passed
      // the threshold for it to close, or if we reset it to its open positino
      if (last) {
        my > height * 0.5 || vy > 0.5 ? close(vy) : open({ canceled });
      }
      // when the user keeps dragging, we just move the sheet according to
      // the cursor position
      else set({ y: my, immediate: true });
    },
    {
      initial: () => [0, y.get()],
      filterTaps: true,
      bounds: { top: 0 },
      rubberband: true,
    }
  );

  const display = y.to((py) => (py < height ? "block" : "none"));
  const animatedDivProps = bind();

  return (
    <>
      <Button
        onPointerDown={(event) => {
          event.preventDefault();
          if (isOpenRef.current) {
            close();
          } else {
            getDrawerCloseFunctionsWithoutCurrent(
              uniqueDrawerIdRef.current
            ).forEach((otherDrawerClose) => {
              otherDrawerClose();
            });
            open({ canceled: false });
          }
        }}
      />
      <Portal>
        <animated.div
          ref={drawerRef}
          style={{
            zIndex: 10,
            position: "fixed",
            height: "calc(100vh)",
            width: "100vw",
            borderRadius: "12px 12px 0px",
            touchAction: "none",
            display,
            bottom: `calc(-100vh + ${height}px)`,
            boxShadow: "0px 0px 8px 1px #D3D3D3",
            background: theme.colors.background,
            y,
          }}
          {...animatedDivProps}
          onPointerDown={(event) => {
            if (
              !shouldIgnoreDragging(event.target) &&
              animatedDivProps.onPointerDown
            ) {
              animatedDivProps.onPointerDown(event);
            }
          }}
          // prevent to trigger that the editor looses focus
          // when dragging the drawer except it's an input
          onMouseDown={(event) => {
            if (event.target.tagName !== "INPUT") {
              event.preventDefault();
            }
          }}
        >
          {children({
            onPointerDownClose: (event) => {
              event.preventDefault();
              event.stopPropagation();
              close();
            },
            close: () => {
              close();
            },
          })}
        </animated.div>
      </Portal>
    </>
  );
}
