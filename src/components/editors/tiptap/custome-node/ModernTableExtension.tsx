// components/editors/tippap/ModernTableExtension.tsx

"use client";

import { Table, TableOptions } from "@tiptap/extension-table";
import {
  EditorState,
  Plugin,
  PluginKey,
  Transaction,
} from "@tiptap/pm/state";
import {
  Decoration,
  DecorationSet,
  EditorView
} from "@tiptap/pm/view";
import { Editor, isNodeSelection } from "@tiptap/react";
import { GripVertical, Plus } from "lucide-react";
import { createRoot } from "react-dom/client";

function findActiveTable(state: EditorState) {
  const { selection } = state;
  if (isNodeSelection(selection) && selection.node.type.name === "table") {
    return { pos: selection.from, node: selection.node };
  }

  const $anchor = state.selection.$anchor;
  for (let d = $anchor.depth; d > 0; d--) {
    const node = $anchor.node(d);
    if (node.type.name === "table") {
      return { pos: $anchor.posAtIndex(0, d - 1), node };
    }
  }
  return null;
}

function createDragHandle() {
  const widget = document.createElement("div");
  widget.className =
    "absolute -left-6 top-2 z-50 text-muted-foreground hover:text-foreground cursor-grab";
  widget.setAttribute("contenteditable", "false");
  widget.setAttribute("data-drag-handle", "true");

  const root = createRoot(widget);
  root.render(<GripVertical className="h-4 w-4" />);
  return widget;
}

function createAddButton(
  type: "col" | "row",
  editor: Editor,
  pos: number,
  leaveTimer: { id: NodeJS.Timeout | null } 
) {
  const widget = document.createElement("button");
  
  widget.className = `absolute z-50 w-5 h-5 flex items-center justify-center 
    bg-popover text-popover-foreground border border-border 
    rounded-full shadow-lg ${
    type === "col"
      ? "top-1/2 -translate-y-1/2 -right-2.5" 
      : "left-1/2 -translate-x-1/2 -bottom-2.5" 
  }`;
  widget.setAttribute("contenteditable", "false");

  widget.onclick = (e) => {
    e.preventDefault();
    if (type === "col") {
      editor.chain().focus().addColumnAfter().run();
    } else {
      editor.chain().focus().addRowAfter().run();
    }
  };
  
  widget.onmouseenter = () => {
    if (leaveTimer.id) {
      clearTimeout(leaveTimer.id);
      leaveTimer.id = null;
    }
  };

  const root = createRoot(widget);
  root.render(<Plus className="h-4 w-4" />);
  return widget;
}


function tableUIPlugin(editor: Editor): Plugin {

  const leaveTimer: { id: NodeJS.Timeout | null } = { id: null };
  let hoveredCellPos: number | null = null; 

  return new Plugin({
    key: new PluginKey("modern-table-ui"),

    state: {
      init: (): { decorationSet: DecorationSet } => ({
        decorationSet: DecorationSet.empty,
      }),
      apply(
        tr: Transaction,
        value: { decorationSet: DecorationSet },
        oldState: EditorState,
        newState: EditorState
      ): { decorationSet: DecorationSet } {
        const table = findActiveTable(newState);
        if (!table) {
          hoveredCellPos = null;
          return { decorationSet: DecorationSet.empty };
        }

        if (!tr.docChanged && !tr.selectionSet && !tr.getMeta("pointer")) {
          return value;
        }

        const decorations: Decoration[] = [];

        decorations.push(
          Decoration.widget(table.pos + 1, createDragHandle(), {
            side: -1,
          })
        );

        if (hoveredCellPos !== null) {
          decorations.push(
            Decoration.widget(
              hoveredCellPos,
              createAddButton("col", editor, hoveredCellPos, leaveTimer),
              { side: 1 } 
            )
          );
          decorations.push(
            Decoration.widget(
              hoveredCellPos,
              createAddButton("row", editor, hoveredCellPos, leaveTimer),
              { side: 1 }
            )
          );
        }

        return {
          decorationSet: DecorationSet.create(newState.doc, decorations),
        };
      },
    },

    props: {
      decorations(this: Plugin, state: EditorState): DecorationSet | undefined {
        return this.getState(state)?.decorationSet;
      },

      handleDOMEvents: {
        mousemove: (view: EditorView, event: MouseEvent): boolean => {
        
          if (leaveTimer.id) {
            clearTimeout(leaveTimer.id);
            leaveTimer.id = null;
          }
          
          const target = event.target as HTMLElement;
          const cell = target.closest("td, th");

          if (!cell) return false; 

          const cellPos = view.posAtDOM(cell, 0);
          if (cellPos === hoveredCellPos) return false;

          hoveredCellPos = cellPos;
          view.dispatch(view.state.tr.setMeta("pointer", true));
          return false;
        },
        mouseleave: (view: EditorView, event: MouseEvent): boolean => {
         
          if (hoveredCellPos !== null) {
            if (leaveTimer.id) clearTimeout(leaveTimer.id);
            leaveTimer.id = setTimeout(() => {
              hoveredCellPos = null;
              view.dispatch(view.state.tr.setMeta("pointer", true));
            }, 100);
          }
          return false;
        },
      },
    },
  });
}


export const ModernTableExtension = Table.extend<TableOptions>({
  addProseMirrorPlugins() {

    const parentPlugins = this.parent?.() || [];
    
    return [
      tableUIPlugin(this.editor as Editor),
      ...parentPlugins 
    ];
  },
});