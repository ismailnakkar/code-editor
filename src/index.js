import {basicSetup, EditorView} from 'codemirror';
import {EditorState} from '@codemirror/state';
import {html} from '@codemirror/lang-html';
import {oneDark} from '@codemirror/theme-one-dark';
import {takeOver, textboxAttributes} from './field.js';

export function codeEditor(textarea) {
    // A disabled field is never posted: its editor takes no focus and no edits.
    const disabled = textarea.matches(':disabled');

    const sync = () => {
        textarea.value = view.state.doc.toString();
    };

    const view = new EditorView({
        doc: textarea.value,
        extensions: [
            basicSetup,
            html(),
            oneDark,
            // style.css draws the frame on this class.
            EditorView.editorAttributes.of({class: 'editors-code'}),
            EditorView.contentAttributes.of(textboxAttributes(textarea)),
            EditorState.readOnly.of(disabled || textarea.readOnly),
            EditorView.editable.of(!disabled),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    sync();
                }
            }),
        ],
    });

    const restore = takeOver(textarea, view.dom, {focus: () => view.focus(), sync});

    return {
        view,
        destroy() {
            view.destroy();
            restore();
        },
    };
}
