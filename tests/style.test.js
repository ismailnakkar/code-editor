import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

// Read from disk: Vitest imports CSS, ?raw included, as an empty string.
const read = (path) => readFileSync(resolve(import.meta.dirname, path), 'utf8');
const css = read('../src/style.css');
const readme = read('../README.md');

/** Each rule's declarations, by selector: the stylesheet is flat, with no at-rules. */
const RULES = new Map(Array.from(
    css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g),
    ([, selector, body]) => [selector.trim(), Object.fromEntries(body.split(';')
        .map((declaration) => declaration.split(/:(.*)/s).map((part) => part?.trim()))
        .filter(([name]) => name))],
));

describe('style.css', () => {
    it('defaults, and documents, every custom property it reads, and defines no other', () => {
        const defaults = RULES.get(':where(:root)');
        const used = new Set(Array.from(css.matchAll(/var\((--editors-[a-z-]+)\)/g), ([, name]) => name));

        expect(used.size).toBeGreaterThan(0);
        expect(Object.keys(defaults).sort()).toEqual([...used].sort());

        for (const name of used) {
            expect(readme, name).toContain(`\`${name}\``);
        }
    });

    it('uses logical properties only, so a right-to-left field mirrors', () => {
        expect(RULES.size).toBeGreaterThan(0);

        const physical = /^(?:(?:margin|padding|border)-(?:left|right|top|bottom)|left|right|top|bottom|(?:min-|max-)?(?:width|height))$/;

        for (const [selector, declarations] of RULES) {
            for (const [name, value] of Object.entries(declarations)) {
                expect(name, selector).not.toMatch(physical);
                expect(`${name}: ${value}`, selector).not.toMatch(/^text-align: (?:left|right)$/);
            }
        }
    });
});
