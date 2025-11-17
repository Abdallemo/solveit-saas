// CustomImageExtension.ts

import { UploadedFileMeta } from "@/features/media/server/media-types";
import TiptapImage from "@tiptap/extension-image";

import { Plugin } from "@tiptap/pm/state";
type UploadFunction = (file: File) => Promise<UploadedFileMeta>;
type CleanupFunction = (resourceId: string) => Promise<void>;
export const CustomImageExtension = (
  uploadMedia: UploadFunction,
  cleanupMedia: CleanupFunction
) =>
  TiptapImage.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        "data-temp-id": {
          default: null,
        },
        "data-id": { default: null },
      };
    },

    addCommands() {
      const parentCommands = this.parent?.() || {};

      return {
        setImage:
          (options: { src: string | File; alt?: string; title?: string }) =>
          ({ chain, editor }) => {
            const file = options.src instanceof File ? options.src : undefined;

            if (file) {
              const tempId = `uploading-${Date.now()}`;
              const localUrl = URL.createObjectURL(file);

              chain()
                .focus()
                .insertContent(
                  `<img src="${localUrl}" data-temp-id="${tempId}" alt="Uploading image..." />`
                )
                .run();

              uploadMedia(file)
                .then(({ storageLocation, filePath, fileName, fileType }) => {
                  const publicUrl = storageLocation;

                  editor.state.doc.descendants((node, pos) => {
                    if (
                      node.type.name === "image" &&
                      node.attrs["data-temp-id"] === tempId
                    ) {
                      editor.view.dispatch(
                        editor.state.tr.setNodeMarkup(pos, undefined, {
                          ...node.attrs,
                          src: publicUrl,
                          "data-temp-id": null,
                          "data-id": filePath,
                          "data-keep-ratio":true,
                          alt: fileName || "",
                        })
                      );
                      return false;
                    }
                    return true;
                  });
                })
                .catch((error) => {
                  console.error("Upload failed, removing placeholder:", error);
                  alert("Image upload failed.");
                });

              return true;
            }

            const originalSetImage = parentCommands.setImage as any;

            if (originalSetImage) {
              return originalSetImage(options)({ chain, editor });
            }

            return false;
          },
      };
    },

    addProseMirrorPlugins() {
      const extension = this;
      const ImageNodeType = extension.editor.schema.nodes["image"];

      return [
        new Plugin({
          appendTransaction: (transactions, oldState, newState) => {
            if (!transactions.some((t) => t.docChanged) || !cleanupMedia) {
              return null;
            }

            transactions.forEach((transaction) => {
              oldState.doc.descendants((node, pos) => {
                if (node.type === ImageNodeType) {
                  const resourceId = node.attrs["data-id"];
                  if (!resourceId) return;

                  const newPos = transaction.mapping.map(pos);
                  const newNode = newState.doc.nodeAt(newPos);

                  if (
                    !newNode ||
                    newNode.type.name !== "image" ||
                    newNode.attrs["data-id"] !== resourceId
                  ) {
                    cleanupMedia(resourceId).catch((error) =>
                      console.error(
                        `Cleanup failed for ID: ${resourceId}`,
                        error
                      )
                    );
                  }
                }
              });
            });

            return null;
          },
        }),
      ];
    },
  });
