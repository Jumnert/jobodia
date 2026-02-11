"use client";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { cn } from "@/lib/utils";
import {
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  MDXEditorProps,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  quotePlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ListsToggle,
  InsertThematicBreak,
  InsertTable,
} from "@mdxeditor/editor";
import { Ref } from "react";
import { markdownClassNames } from "./MarkDownRenderer";

export default function InternalMarkdownEditor({
  ref,
  className,
  ...props
}: MDXEditorProps & { ref?: Ref<MDXEditorMethods> }) {
  const isDarkMode = useIsDarkMode();
  return (
    <MDXEditor
      {...props}
      ref={ref}
      className={cn(markdownClassNames, isDarkMode && "dark-theme", className)}
      suppressHtmlProcessing
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <InsertThematicBreak />
              <InsertTable />
            </>
          ),
        }),
      ]}
    />
  );
}
