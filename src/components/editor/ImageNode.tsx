import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import {
  DecoratorBlockNode,
  type SerializedDecoratorBlockNode,
} from "@lexical/react/LexicalDecoratorBlockNode";
import {
  $applyNodeReplacement,
  type ElementFormatType,
  type LexicalNode,
  type LexicalUpdateJSON,
  type NodeKey,
  type Spread,
} from "lexical";
import type { JSX } from "react";

export type SerializedImageNode = Spread<
  {
    altText: string;
    src: string;
  },
  SerializedDecoratorBlockNode
>;

interface ImageNodePayload {
  altText: string;
  format?: ElementFormatType;
  src: string;
}

export class ImageNode extends DecoratorBlockNode {
  __altText: string;
  __src: string;

  static getType() {
    return "image";
  }

  static clone(node: ImageNode) {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__format,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode) {
    return $createImageNode(serializedNode).updateFromJSON(serializedNode);
  }

  constructor(
    src: string,
    altText: string,
    format?: ElementFormatType,
    key?: NodeKey,
  ) {
    super(format, key);
    this.__src = src;
    this.__altText = altText;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      altText: this.getAltText(),
      src: this.getSrc(),
    };
  }

  updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedImageNode>) {
    return super
      .updateFromJSON(serializedNode)
      .setSrc(serializedNode.src)
      .setAltText(serializedNode.altText);
  }

  getSrc() {
    return this.getLatest().__src;
  }

  setSrc(src: string) {
    this.getWritable().__src = src;
    return this;
  }

  getAltText() {
    return this.getLatest().__altText;
  }

  setAltText(altText: string) {
    this.getWritable().__altText = altText;
    return this;
  }

  getTextContent() {
    return this.getAltText();
  }

  decorate(): JSX.Element {
    return (
      <BlockWithAlignableContents
        className={{ base: "editor-image", focus: "editor-image-selected" }}
        format={this.getFormat()}
        nodeKey={this.getKey()}
      >
        <img alt={this.getAltText()} loading="lazy" src={this.getSrc()} />
      </BlockWithAlignableContents>
    );
  }
}

export function $createImageNode({ altText, format, src }: ImageNodePayload) {
  return $applyNodeReplacement(new ImageNode(src, altText, format));
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
