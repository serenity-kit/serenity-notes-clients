let isActive: string | undefined = undefined;
const editorToolbar = document.getElementById("editor-toolbar");

export const setActiveDrawer = (active?: string) => {
  isActive = active;
};

export const getActiveDrawer = () => {
  return isActive;
};

export const closeToolbar = () => {
  const proseMirror = document.getElementsByClassName("ProseMirror")[0];
  // @ts-expect-error editorToolbar must always be available
  editorToolbar.style.height = "0px";
  // @ts-expect-error proseMirror has a style
  proseMirror.style.height = "100vh";
};

export const openToolbar = () => {
  const proseMirror = document.getElementsByClassName("ProseMirror")[0];
  // @ts-expect-error editorToolbar must always be available
  editorToolbar.style.height = "53px";
  // @ts-expect-error proseMirror has a style
  proseMirror.style.height = "calc(100vh - 53px)";
};
