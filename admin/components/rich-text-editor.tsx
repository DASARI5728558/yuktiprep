"use client";

import React from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ReactQuill = dynamic(() => import("./quill-wrapper"), {
  ssr: false,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  // Store Quill instance and selection when user clicks the table button
  const quillRef = React.useRef<any>(null);
  const selectionRef = React.useRef<any>(null);

  // Insert table dialog
  const [insertDialogOpen, setInsertDialogOpen] = React.useState(false);

  // Manage table dialog
  const [manageTableDialogOpen, setManageTableDialogOpen] = React.useState(false);

  // Table size
  const [rows, setRows] = React.useState("3");
  const [cols, setCols] = React.useState("3");

  const modules = React.useMemo(
    () => ({
      markdownShortcuts: {},
      table: true,

      toolbar: {
        container: [
          [
            { header: [1, 2, 3, false] },
            { size: ["small", false, "large", "huge"] },
          ],
          ["bold", "italic", "underline"],
          [{ background: [] }, { color: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "code-block", "blockquote"],
          ["table"],
          ["clean"],
        ],

        handlers: {
          table: function (this: any) {
            const quill = this.quill;

            if (!quill) return;

            // Save the current Quill instance and selection
            quillRef.current = quill;
            selectionRef.current = quill.getSelection();

            const format = quill.getFormat();

            // User is currently inside a table
            if (format.table) {
              setManageTableDialogOpen(true);
              return;
            }

            // User is not inside a table
            setInsertDialogOpen(true);
          },
        },
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "link",
    "image",
    "background",
    "color",
    "table",
    "code-block",
    "blockquote",
    "size",
  ];

  // Insert table
  const handleInsertTable = () => {
    const quill = quillRef.current;
    if (!quill) return;

    const tableModule = quill.getModule("table");
    if (!tableModule) return;

    const rowCount = Number(rows);
    const colCount = Number(cols);

    if (
      !Number.isInteger(rowCount) ||
      !Number.isInteger(colCount) ||
      rowCount <= 0 ||
      colCount <= 0
    ) {
      return;
    }

    // Close dialog FIRST so focus trap is released
    setInsertDialogOpen(false);

    // Wait for the modal to close and release focus, then insert
    setTimeout(() => {
      if (selectionRef.current) {
        quill.setSelection(selectionRef.current);
        quill.focus();
      }
      tableModule.insertTable(rowCount, colCount);
      
      // Optional: reset values
      setRows("3");
      setCols("3");
    }, 100);
  };

  // Manage table
  const handleManageTable = (action: string) => {
    const quill = quillRef.current;
    if (!quill) return;

    const tableModule = quill.getModule("table");
    if (!tableModule) return;

    // Close dialog FIRST
    setManageTableDialogOpen(false);

    setTimeout(() => {
      // Restore selection so Quill knows where to perform the action
      if (selectionRef.current) {
        quill.setSelection(selectionRef.current);
        quill.focus();
      }
      
      if (action === "insertRowAbove") tableModule.insertRowAbove();
      else if (action === "insertRowBelow") tableModule.insertRowBelow();
      else if (action === "insertColumnLeft") tableModule.insertColumnLeft();
      else if (action === "insertColumnRight") tableModule.insertColumnRight();
      else if (action === "deleteRow") tableModule.deleteRow();
      else if (action === "deleteColumn") tableModule.deleteColumn();
      else if (action === "deleteTable") tableModule.deleteTable();
    }, 100);
  };

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const toolbar = document.querySelector(".ql-toolbar");

      if (toolbar) {
        const buttons = toolbar.querySelectorAll("button");

        buttons.forEach((btn) => {
          const className = btn.className;

          if (className.includes("ql-bold")) {
            btn.title = "Bold";
          } else if (className.includes("ql-italic")) {
            btn.title = "Italic";
          } else if (className.includes("ql-underline")) {
            btn.title = "Underline";
          } else if (className.includes("ql-link")) {
            btn.title = "Insert Link";
          } else if (className.includes("ql-image")) {
            btn.title = "Insert Image";
          } else if (className.includes("ql-code-block")) {
            btn.title = "Code Block";
          } else if (className.includes("ql-blockquote")) {
            btn.title = "Blockquote";
          } else if (className.includes("ql-table")) {
            btn.title = "Insert / Delete Table";
          } else if (className.includes("ql-clean")) {
            btn.title = "Clear Formatting";
          } else if (className.includes("ql-list")) {
            if (btn.value === "ordered") {
              btn.title = "Numbered List";
            } else if (btn.value === "bullet") {
              btn.title = "Bulleted List";
            }
          }
        });

        const pickers = toolbar.querySelectorAll(".ql-picker");

        pickers.forEach((picker) => {
          const className = picker.className;

          if (className.includes("ql-header")) {
            picker.setAttribute("title", "Heading");
          } else if (className.includes("ql-size")) {
            picker.setAttribute("title", "Text Size");
          } else if (className.includes("ql-background")) {
            picker.setAttribute("title", "Highlight Color");
          } else if (className.includes("ql-color")) {
            picker.setAttribute("title", "Text Color");
          }
        });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <div 
        className={`bg-white rounded-md border overflow-hidden text-black [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[300px] [&_.ql-editor]:overflow-y-auto transition-all duration-200 ${
          insertDialogOpen || manageTableDialogOpen ? "blur-[2px] opacity-70 pointer-events-none" : ""
        }`}
      >
        <style>{`
          .ql-snow .ql-toolbar button.ql-table {
            width: 40px;
          }

          .ql-snow .ql-toolbar button.ql-table::after {
            content: "Table";
            font-size: 10px;
            font-weight: bold;
            color: #444;
          }
          
          /* Remove Quill's native outer borders so the parent container's rounded border takes over */
          .ql-toolbar.ql-snow {
            border: none !important;
            border-bottom: 1px solid #e5e7eb !important;
          }
          .ql-container.ql-snow {
            border: none !important;
          }
          
          /* Give heading tags a little bit of gap and Poppins font */
          .ql-editor h1, .ql-editor h2, .ql-editor h3 {
            font-family: var(--font-poppins), sans-serif !important;
            margin-top: 1.2em !important;
            margin-bottom: 0.6em !important;
          }
          
          /* Style first row of tables as a header */
          .ql-editor table tr:first-child td {
            background-color: var(--primarynavy) !important;
          }
          .ql-editor table tr:first-child td,
          .ql-editor table tr:first-child td * {
            color: white !important;
            font-weight: 600 !important;
          }
        `}</style>

        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || "Write description here..."}
        />
      </div>

      {/* INSERT TABLE DIALOG */}
      <Dialog
        open={insertDialogOpen}
        onOpenChange={setInsertDialogOpen}
      >
        <DialogContent className="z-[70]">
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>

            <DialogDescription>
              Choose the number of rows and columns for your table.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* ROWS */}
            <div className="grid gap-2">
              <Label htmlFor="table-rows">
                Number of Rows
              </Label>

              <Input
                id="table-rows"
                type="number"
                min="1"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
              />
            </div>

            {/* COLUMNS */}
            <div className="grid gap-2">
              <Label htmlFor="table-cols">
                Number of Columns
              </Label>

              <Input
                id="table-cols"
                type="number"
                min="1"
                value={cols}
                onChange={(e) => setCols(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInsertDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleInsertTable}
            >
              Insert Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* MANAGE TABLE DIALOG */}
      <Dialog
        open={manageTableDialogOpen}
        onOpenChange={setManageTableDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Table</DialogTitle>
            <DialogDescription>
              Choose an action to modify or delete the current table.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-500">Rows</span>
              <Button variant="outline" onClick={() => handleManageTable("insertRowAbove")}>Insert Row Above</Button>
              <Button variant="outline" onClick={() => handleManageTable("insertRowBelow")}>Insert Row Below</Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleManageTable("deleteRow")}>Delete Row</Button>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-500">Columns</span>
              <Button variant="outline" onClick={() => handleManageTable("insertColumnLeft")}>Insert Col Left</Button>
              <Button variant="outline" onClick={() => handleManageTable("insertColumnRight")}>Insert Col Right</Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleManageTable("deleteColumn")}>Delete Column</Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-between border-t pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleManageTable("deleteTable")}
            >
              Delete Entire Table
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setManageTableDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}