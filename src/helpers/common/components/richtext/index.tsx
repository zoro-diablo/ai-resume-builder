import { useRef, useEffect, memo, useState } from 'react';
import 'jodit/es2015/jodit.min.css';

import { LinkPlugin } from './plugins/link';

import styles from './jodit.module.css';

interface IRichtext {
  label: string;
  onChange: (htmlOutput: string) => void;
  value: string;
  name: string;
}

export const RichtextEditor = memo(({ label, onChange, value, name }: IRichtext) => {
  const editorContainerRef = useRef<HTMLTextAreaElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const [editorInstanceCreated, setEditorInstanceCreated] = useState(false);
  const isInternalChange = useRef(false); // Track if change is from user input
  const onChangeRef = useRef(onChange); // Store the latest onChange handler

  // Update the onChange reference when it changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (editorContainerRef.current) {
      const initEditor = async () => {
        const { Jodit } = await import('jodit');
        const editor = Jodit.make(editorContainerRef.current as HTMLTextAreaElement, {
          showCharsCounter: false,
          showWordsCounter: false,
          showXPathInStatusbar: false,
          buttons: ['bold', 'italic', 'link', 'ul', 'ol', 'undo', 'redo'],
          disablePlugins:
            'add-new-line,print,preview,table,table-keyboard-navigation,select-cells,resize-cells,file,video,media,image,image-processor,image-properties,xpath,tab,stat,search,powered-by-jodit,mobile,justify,inline-popup,indent,iframe,fullsize',
          useSearch: false,
          askBeforePasteHTML: false,
          askBeforePasteFromWord: false,
          defaultActionOnPaste: 'insert_only_text',
          maxHeight: 200,
          link: LinkPlugin,
        });
        
        editor.value = value;
        editorRef.current = editor;
        setEditorInstanceCreated(true);

        // Set up the change handler with a stable reference
        const handleChange = (newValue: string) => {
          isInternalChange.current = true;
          // Use the ref to get the latest onChange handler
          onChangeRef.current(newValue);
        };

        editor.events.on('change', handleChange);

        // Cleanup function to remove event listener
        return () => {
          if (editor && editor.events) {
            editor.events.off('change', handleChange);
          }
        };
      };
      
      initEditor();
    }

    // Cleanup on unmount
    return () => {
      if (editorRef.current && editorRef.current.destruct) {
        editorRef.current.destruct();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dependencies to prevent re-initialization

  useEffect(() => {
    if (editorRef.current && editorInstanceCreated) {
      // Only update editor value if the change came from outside (not from user typing)
      if (!isInternalChange.current && editorRef.current.value !== value) {
        const selection = editorRef.current.selection;
        const range = selection.createRange();
        
        // Save cursor position before updating
        const savedRange = range.cloneRange();
        
        editorRef.current.value = value;
        
        // Restore cursor position after updating
        try {
          selection.selectRange(savedRange);
        } catch (e) {
          // If restoring position fails, place cursor at end
          selection.setCursorAfter(editorRef.current.editor.lastChild || editorRef.current.editor);
        }
      }
      
      // Reset the flag
      isInternalChange.current = false;
    }
  }, [value, editorInstanceCreated]);

  return (
    <div className={`${styles.editor_wrapper} mb-4`}>
      <div
        style={{
          padding: '8px 16px 0px',
        }}
        className="text-resume-800 text-xs mb-1"
      >
        <span>{label}</span>
      </div>
      <textarea
        ref={editorContainerRef}
        id={`richtext-${name}`}
        name={name}
        className={`min-h-[200px] min-w-full bg-[rgba(0,0,0,0.06)]`}
      ></textarea>
    </div>
  );
});

RichtextEditor.displayName = 'RichtextEditor';