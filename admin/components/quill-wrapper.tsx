import ReactQuill, { Quill } from "react-quill-new";
// @ts-expect-error missing types
import MarkdownShortcuts from "quill-markdown-shortcuts";

Quill.register("modules/markdownShortcuts", MarkdownShortcuts);

export default ReactQuill;
