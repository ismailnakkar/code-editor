# @ismailnakkar/code-editor

An HTML code editor ([CodeMirror 6](https://codemirror.net)) that replaces a `<textarea>`. The textarea stays in the
form, hidden, and holds the editor's code, so the form still posts it, works without JavaScript, and old input refills
it.

To edit rich text instead, use [@ismailnakkar/rich-text-editor](https://github.com/ismailnakkar/rich-text-editor).

## Install

```bash
npm i @ismailnakkar/code-editor
```

npm also installs the peer dependencies `codemirror` (`^6.0.2`), `@codemirror/lang-html` (`^6.4.12`),
`@codemirror/state` (`^6.0.0`) and `@codemirror/theme-one-dark` (`^6.1.3`). Type declarations are included.

## Usage

```blade
<label for="ad-code">Ad code</label>
<textarea id="ad-code" name="code" class="code-editor">{{ old('code', $ad->code) }}</textarea>
```

CodeMirror weighs a few hundred kB, so load the editor only on pages that have a field:

```js
const fields = document.querySelectorAll('textarea.code-editor');

if (fields.length > 0) {
    import('@ismailnakkar/code-editor/style.css');
    const {codeEditor} = await import('@ismailnakkar/code-editor');

    fields.forEach((field) => codeEditor(field));
}
```

`codeEditor(textarea)` takes no options and returns `{view, destroy}`:

- `view` is CodeMirror's `EditorView`.
- `destroy()` removes the editor and shows the textarea again, holding the last edit.

The editor goes after the textarea, or after a `<label>` that wraps it. It reads the textarea once, then writes every
edit to it, and again on `submit`. To change the code from a script, dispatch to `view`: a value set on the textarea is
overwritten.

The textarea's states are read once, when the editor is made:

- `readonly` makes the editor read-only. `disabled`, set on the textarea or on its `<fieldset>`, makes it one that
  can't be focused or edited, since the form won't post it.
- `required` is lifted until `destroy()`: a hidden field can't show the browser's message, so an empty one would block
  the submit without a word. Validate on the server.

To follow a later change, `destroy()` the editor and call `codeEditor()` again.

## Styling

Import `@ismailnakkar/code-editor/style.css` once, then override these on `:root` or any ancestor of the field. The
shared ones have the same name and default in @ismailnakkar/rich-text-editor, so an app using both sets them once.

| Property | Default | Styles | Shared |
| --- | --- | --- | --- |
| `--editors-border` | `1px solid #ced4da` | The frame | Yes |
| `--editors-radius` | `.375rem` | The frame | Yes |
| `--editors-focus-color` | `#2563eb` | The focus ring | Yes |
| `--editors-disabled-opacity` | `.6` | A disabled editor | Yes |
| `--editors-mono-font` | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | The code | |
| `--editors-code-min-height` | `16em` | The code area's minimum height | |
| `--editors-code-max-height` | `600px` | The code area's maximum height, past which it scrolls | |

The colours are CodeMirror's One Dark theme. For anything else, target `.editors-code`, the class on CodeMirror's
`.cm-editor`.

## Accessibility

- The text is CodeMirror's multi-line `textbox`. It takes the textarea's `aria-*` attributes (so its
  `aria-describedby` hint or error and `aria-invalid` reach it), and `aria-required` when the textarea is `required`.
  These are read once, when the editor is made. A `readonly` textarea gives it `aria-readonly`, a disabled one
  `aria-disabled`.
- Without `aria-labelledby` or `aria-label`, the text is named by the textarea's labels, minus any `hidden` or
  `aria-hidden` content. Clicking a label focuses the text.
- The frame is ringed while the text has focus.
- Tab leaves the editor; it does not indent.

## Testing

The editor needs a DOM, so run your app's tests in happy-dom or jsdom (Vitest: `environment: 'happy-dom'`).

Run this package's suite with `npm test`.

## Upgrading

Nothing yet: 1.0.0 is the first release.
