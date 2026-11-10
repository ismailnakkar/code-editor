import type {EditorView} from 'codemirror';

export interface CodeEditor {
    readonly view: EditorView;
    /** Removes the editor and shows the textarea again, holding the last edit. */
    destroy(): void;
}

/** Puts an HTML editor in the textarea's place; the hidden textarea stays the posted field and holds every edit. */
export function codeEditor(textarea: HTMLTextAreaElement): CodeEditor;
