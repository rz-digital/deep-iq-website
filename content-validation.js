// @ts-check
import Ajv from 'ajv';
import pageSchema from './schemas/page.schema.json';
import siteContentSchema from './schemas/site-content.schema.json';

/**
 * @typedef {{ body: string }} PageContent
 * @typedef {{
 *   meta: { title: string, description: string },
 *   text: Record<string, string>,
 *   html: Record<string, string>,
 *   attributes: Array<{ selector: string, name: string, value: string }>,
 *   form: { submittingLabel: string, successLabel: string, successMessage: string }
 * }} SiteContent
 */

const ajv = new Ajv({ allErrors: true, strict: true });
const validatePage = ajv.compile(pageSchema);
const validateSiteContent = ajv.compile(siteContentSchema);

/** @param {import('ajv').ErrorObject[] | null | undefined} errors */
const formatErrors = (errors) =>
  (errors || [])
    .map(({ instancePath, message }) => `${instancePath || '/'} ${message || 'is invalid'}`)
    .join('; ');

/** @param {string} markup @param {string} label */
const assertSafeMarkup = (markup, label) => {
  if (/<script\b|\son\w+\s*=|javascript:/i.test(markup)) {
    throw new TypeError(`${label} contains executable markup`);
  }
};

/** @param {unknown} value @returns {PageContent} */
export function assertPageContent(value) {
  if (!validatePage(value)) {
    throw new TypeError(`page.json failed validation: ${formatErrors(validatePage.errors)}`);
  }
  const page = /** @type {PageContent} */ (value);
  assertSafeMarkup(page.body, 'page.json body');
  return page;
}

/** @param {unknown} value @returns {SiteContent} */
export function assertSiteContent(value) {
  if (!validateSiteContent(value)) {
    throw new TypeError(`site-content.json failed validation: ${formatErrors(validateSiteContent.errors)}`);
  }
  const content = /** @type {SiteContent} */ (value);
  Object.entries(content.html).forEach(([selector, markup]) => {
    assertSafeMarkup(markup, `site-content.json html[${selector}]`);
  });
  return content;
}
