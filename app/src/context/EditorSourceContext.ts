import React from "react";

export const EditorSourceContext = React.createContext(null);

export const useEditorSource = () => React.useContext(EditorSourceContext);
