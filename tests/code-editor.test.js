import {beforeEach, describe, expect, it, vi} from 'vitest';
import {codeEditor} from '../src/index.js';

beforeEach(() => {
    document.body.innerHTML = `
        <form>
            <label for="f-code">Tag</label>
            <textarea id="f-code" name="code">&lt;script&gt;tag&lt;/script&gt;</textarea>
        </form>`;
});

const field = () => document.querySelector('textarea');

const submit = () => document.querySelector('form').dispatchEvent(new Event('submit', {cancelable: true}));

describe('codeEditor', () => {
    it('puts an editor on the code in the textarea\'s place, named by its label', () => {
        const {view} = codeEditor(field());

        expect(field().hidden).toBe(true);
        expect(field().nextElementSibling).toBe(view.dom);
        expect(view.dom.classList).toContain('editors-code');
        expect(view.state.doc.toString()).toBe('<script>tag</script>');
        expect(view.contentDOM.getAttribute('aria-label')).toBe('Tag');
    });

    it('writes every edit into the textarea, which stays the posted field', () => {
        const {view} = codeEditor(field());

        view.dispatch({changes: {from: 0, to: view.state.doc.length, insert: '<div>new</div>'}});

        expect(field().value).toBe('<div>new</div>');
        expect(new FormData(document.querySelector('form')).get('code')).toBe('<div>new</div>');
    });

    it('writes the code into the textarea again on submit', () => {
        const {view} = codeEditor(field());
        field().value = 'stale';

        submit();

        expect(field().value).toBe(view.state.doc.toString());
    });

    it('is focused by a click on its label, which points at the hidden textarea', () => {
        const {view} = codeEditor(field());

        document.querySelector('label').click();

        expect(document.activeElement).toBe(view.contentDOM);
    });

    it('is named by its aria-labelledby, then its aria-label, then its labels, and gets no name without any', () => {
        field().setAttribute('aria-label', 'Ad code');

        expect(codeEditor(field()).view.contentDOM.getAttribute('aria-label')).toBe('Ad code');

        document.body.innerHTML = '<label for="f-code">Tag</label>'
            + '<textarea id="f-code" aria-labelledby="f-heading"></textarea>';

        expect(codeEditor(field()).view.contentDOM.hasAttribute('aria-label')).toBe(false);

        document.body.innerHTML = '<textarea></textarea>';

        expect(codeEditor(field()).view.contentDOM.hasAttribute('aria-label')).toBe(false);
    });

    it('takes the hint, error and required state the textarea carries', () => {
        field().setAttribute('aria-describedby', 'f-code-error');
        field().setAttribute('aria-invalid', 'true');
        field().required = true;

        const {contentDOM} = codeEditor(field()).view;

        expect(contentDOM.getAttribute('aria-describedby')).toBe('f-code-error');
        expect(contentDOM.getAttribute('aria-invalid')).toBe('true');
        expect(contentDOM.getAttribute('aria-required')).toBe('true');
    });

    it('lifts required while it is the field, so an empty one does not block the submit unseen', () => {
        field().value = '';
        field().required = true;

        const {destroy} = codeEditor(field());

        expect(document.querySelector('form').checkValidity()).toBe(true);

        destroy();

        expect(field().required).toBe(true);
    });

    it('takes the textarea\'s readonly and disabled states', () => {
        field().readOnly = true;

        const {contentDOM, state} = codeEditor(field()).view;

        expect(state.readOnly).toBe(true);
        expect(contentDOM.getAttribute('contenteditable')).toBe('true');
        expect(contentDOM.getAttribute('aria-readonly')).toBe('true');

        document.body.innerHTML = '<textarea disabled></textarea>';

        const disabled = codeEditor(field()).view.contentDOM;

        expect(disabled.getAttribute('contenteditable')).toBe('false');
        expect(disabled.getAttribute('aria-disabled')).toBe('true');
    });

    it('follows a label that wraps the textarea, named by its text without the code or hidden markers', () => {
        document.body.innerHTML = '<form><label>Tag <span aria-hidden="true">*</span><span hidden>(required)</span>'
            + '<textarea name="code">&lt;script&gt;tag&lt;/script&gt;</textarea></label></form>';

        const {view} = codeEditor(field());
        const focus = vi.spyOn(view, 'focus');

        expect(view.contentDOM.getAttribute('aria-label')).toBe('Tag');
        expect(document.querySelector('label').nextElementSibling).toBe(view.dom);

        view.contentDOM.click();

        expect(focus).not.toHaveBeenCalled();
    });

    it('gives the textarea its place back on destroy, holding the last edit', () => {
        const {view, destroy} = codeEditor(field());
        const focus = vi.spyOn(view, 'focus');

        view.dispatch({changes: {from: 0, insert: '<!-- ad -->'}});
        destroy();

        expect(document.querySelector('.cm-editor')).toBeNull();
        expect(field().hidden).toBe(false);
        expect(field().value).toBe('<!-- ad --><script>tag</script>');

        // Its submit and label listeners are gone.
        field().value = 'typed';
        submit();
        document.querySelector('label').click();

        expect(field().value).toBe('typed');
        expect(focus).not.toHaveBeenCalled();
    });
});
