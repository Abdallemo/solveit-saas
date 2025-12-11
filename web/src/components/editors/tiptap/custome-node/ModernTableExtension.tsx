"use client";

import { Table, TableOptions } from "@tiptap/extension-table";
import { EditorState, Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Editor, isNodeSelection } from "@tiptap/react";
import { Plus } from "lucide-react";
import { createRoot } from "react-dom/client";

export const tableUIKey = new PluginKey("modern-table-ui");

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

function createAddButton(
  type: "col" | "row",
  editor: Editor,
  pos: number,
  width: number,
  height: number
) {
  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position: absolute; top: 0; left: 0; width: 0; height: 0; overflow: visible; z-index: 50; pointer-events: none;";

  const widget = document.createElement("button");

  const xOffset = type === "col" ? width - 15 : width / 2 - 10;
  const yOffset = type === "col" ? height / 2 - 10 : height - 15;

  widget.className = `absolute flex items-center justify-center w-5 h-5 
    bg-popover text-popover-foreground border border-border 
    rounded-full shadow-lg cursor-pointer hover:bg-accent pointer-events-auto`;

  widget.style.transform = `translate(${xOffset}px, ${yOffset}px)`;


  widget.setAttribute("contenteditable", "false");
  widget.type = "button";

  widget.onmousedown = (e) => {
    e.preventDefault();
    if (type === "col") {
      if (!editor.isEditable) return;
      editor.chain().focus().addColumnAfter().run();
    } else {
      if (!editor.isEditable) return;
      editor.chain().focus().addRowAfter().run();
    }
  };

  wrapper.appendChild(widget);

  const root = createRoot(widget);
  root.render(<Plus className="h-3 w-3" />);

  return wrapper;
}

function tableUIPlugin(editor: Editor): Plugin {
  const leaveTimer: { id: NodeJS.Timeout | null } = { id: null };

  return new Plugin({
    key: tableUIKey,

    state: {
      init: () => ({
        decorationSet: DecorationSet.empty,
        hoveredCell: null as {
          pos: number;
          width: number;
          height: number;
        } | null,
      }),
      apply(tr, value, oldState, newState) {
        const { decorationSet, hoveredCell } = value;

        const newHover = tr.getMeta(tableUIKey);

        if (tr.docChanged && newHover === undefined) {
          return {
            decorationSet: decorationSet.map(tr.mapping, newState.doc),
            hoveredCell: hoveredCell
              ? { ...hoveredCell, pos: tr.mapping.map(hoveredCell.pos) }
              : null,
          };
        }

        const currentHover = newHover !== undefined ? newHover : hoveredCell;

        if (!tr.docChanged && !tr.selectionSet && newHover === undefined) {
          return value;
        }

        const table = findActiveTable(newState);
        if (!table) {
          return { decorationSet: DecorationSet.empty, hoveredCell: null };
        }

        const decorations: Decoration[] = [];

        if (currentHover !== null) {
          if (currentHover.pos <= newState.doc.content.size) {
            decorations.push(
              Decoration.widget(
                currentHover.pos,
                createAddButton(
                  "col",
                  editor,
                  currentHover.pos,
                  currentHover.width,
                  currentHover.height
                ),
                { side: 1, key: "col-btn" }
              )
            );
            decorations.push(
              Decoration.widget(
                currentHover.pos,
                createAddButton(
                  "row",
                  editor,
                  currentHover.pos,
                  currentHover.width,
                  currentHover.height
                ),
                { side: 1, key: "row-btn" }
              )
            );
          }
        }

        return {
          decorationSet: DecorationSet.create(newState.doc, decorations),
          hoveredCell: currentHover,
        };
      },
    },

    props: {
      decorations(state) {
        return this.getState(state)?.decorationSet;
      },

      handleDOMEvents: {
        mousemove: (view, event) => {
          if (leaveTimer.id) {
            clearTimeout(leaveTimer.id);
            leaveTimer.id = null;
          }

          const target = event.target as HTMLElement;
          const cell = target.closest("td, th");

          if (!cell) return false;

          // Get Dimensions for positioning
          const rect = cell.getBoundingClientRect();
          const cellPos = view.posAtDOM(cell, 0);

          const currentState = tableUIKey.getState(view.state);

          // Recursion Fix: Only update if pos changes OR dimensions change significantly (>1px)
          // This prevents the infinite loop from sub-pixel rendering shifts
          const prev = currentState?.hoveredCell;
          const isSamePos = prev && prev.pos === cellPos;
          const isSameSize =
            prev &&
            Math.abs(prev.width - rect.width) < 2 &&
            Math.abs(prev.height - rect.height) < 2;

          if (!isSamePos || !isSameSize) {
            view.dispatch(
              view.state.tr.setMeta(tableUIKey, {
                pos: cellPos,
                width: rect.width,
                height: rect.height,
              })
            );
          }

          return false;
        },
        mouseleave: (view, event) => {
          const currentState = tableUIKey.getState(view.state);

          if (currentState?.hoveredCell !== null) {
            if (leaveTimer.id) clearTimeout(leaveTimer.id);
            leaveTimer.id = setTimeout(() => {
              view.dispatch(view.state.tr.setMeta(tableUIKey, null));
            }, 500);
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
    return [tableUIPlugin(this.editor as Editor), ...parentPlugins];
  },
});
