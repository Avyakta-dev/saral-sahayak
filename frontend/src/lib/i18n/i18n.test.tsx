import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import {
  LocaleProvider,
  useLocale,
  dictionaries,
  locales,
  translate,
  messageKey,
  type UiLocale,
} from './index';
import { en, type MessageKey } from './en';
import AnswerCard from '../../components/AnswerCard';
import { getWalkthrough } from '../walkthrough';

const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const scripts = {
  hi: /\p{Script=Devanagari}/u,
  kn: /\p{Script=Kannada}/u,
  ta: /\p{Script=Tamil}/u,
  te: /\p{Script=Telugu}/u,
  ml: /\p{Script=Malayalam}/u,
};
it.each(locales)('%s has exact key/placeholder parity and no English fallback', (locale) => {
  expect(Object.keys(dictionaries[locale]).sort()).toEqual(Object.keys(en).sort());
  for (const key of Object.keys(en) as MessageKey[]) {
    expect(dictionaries[locale][key].trim()).not.toBe('');
    expect(placeholders(dictionaries[locale][key])).toEqual(placeholders(en[key]));
    if (locale !== 'en' && key !== 'imageFormatsShort' && key !== 'charCount')
      expect(dictionaries[locale][key]).toMatch(scripts[locale]);
  }
});
it('interpolates arbitrary literal values without replacement syntax or recursive translation', () => {
  const name = '{name} $& <unsafe>';
  for (const locale of locales) expect(translate(locale, 'enlarge', { name })).toContain(name);
  expect(() => translate('hi', 'enlarge')).toThrow('Missing interpolation');
  expect(messageKey('PRIVATE_PROVIDER_SECRET')).toBe('errorGeneric');
});
let changeLocale: (locale: UiLocale) => void;
function Harness() {
  const { setLocale, message } = useLocale();
  changeLocale = setLocale;
  return <p>{message('This image is empty. Choose another image.')}</p>;
}
it('updates stored host errors reactively and restores document lang on unmount', () => {
  const original = document.documentElement.lang;
  const view = render(
    <LocaleProvider>
      <Harness />
    </LocaleProvider>,
  );
  for (const locale of locales) {
    act(() => changeLocale(locale));
    expect(document.documentElement.lang).toBe(locale);
    expect(screen.getByText(translate(locale, 'errorImageEmpty'))).toBeVisible();
  }
  view.unmount();
  expect(document.documentElement.lang).toBe(original);
});
it('preserves Hindi model/sample prose, draft placeholders and checklist while UI changes', async () => {
  const response = getWalkthrough('hi');
  render(
    <LocaleProvider>
      <Harness />
      <AnswerCard response={response} onEdit={() => {}} />
    </LocaleProvider>,
  );
  await userEvent.click(screen.getByRole('tab', { name: 'Next steps' }));
  await userEvent.click(screen.getAllByRole('checkbox')[0]);
  for (const locale of locales) {
    act(() => changeLocale(locale));
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
    expect(screen.getByRole('region', { name: translate(locale, 'sampleTitle') })).toHaveAttribute(
      'lang',
      'hi',
    );
    expect(screen.getByText(response.actions[0].text)).toBeVisible();
  }
});
