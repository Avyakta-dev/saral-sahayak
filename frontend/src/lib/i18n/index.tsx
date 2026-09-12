import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { en, type Dictionary, type MessageKey } from './en';
import { hi } from './hi';
import { kn } from './kn';
import { ta } from './ta';
import { te } from './te';
import { ml } from './ml';

export const locales = ['en', 'hi', 'kn', 'ta', 'te', 'ml'] as const;
export type UiLocale = (typeof locales)[number];
export const nativeNames: Record<UiLocale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  ml: 'മലയാളം',
};
export const dictionaries: Record<UiLocale, Dictionary> = { en, hi, kn, ta, te, ml };
export type Params = Record<string, string | number>;
export type Message = { key: MessageKey; params?: Params };
export function translate(locale: UiLocale, key: MessageKey, params: Params = {}): string {
  const value = dictionaries[locale][key];
  if (typeof value !== 'string') throw new Error(`Missing interface message: ${locale}/${key}`);
  return value.replace(/\{(\w+)\}/g, (_, name: string) => {
    if (!Object.hasOwn(params, name)) throw new Error(`Missing interpolation: ${key}/${name}`);
    return String(params[name]);
  });
}
export function LocalizedText({
  id,
  values,
}: {
  id: MessageKey;
  values: Record<string, ReactNode>;
}) {
  const { locale } = useLocale();
  return (
    <>
      {dictionaries[locale][id].split(/(\{\w+\})/g).map((part, index) => {
        if (!/^\{\w+\}$/.test(part)) return part;
        const key = part.slice(1, -1);
        if (!Object.hasOwn(values, key)) throw new Error(`Missing interpolation: ${id}/${key}`);
        return <span key={index}>{values[key]}</span>;
      })}
    </>
  );
}
// Only known host-authored messages enter this map. Unknown errors never display
// raw exception/provider text. It also keeps existing English API tests compatible.
export function messageKey(message: string): MessageKey {
  return (Object.keys(en) as MessageKey[]).find((key) => en[key] === message) ?? 'errorGeneric';
}
const fallback = {
  locale: 'en' as UiLocale,
  setLocale: (_locale: UiLocale) => {},
  t: (key: MessageKey, params?: Params) => translate('en', key, params),
  message: (value: string | Message) =>
    typeof value === 'string'
      ? value
        ? translate('en', messageKey(value))
        : ''
      : translate('en', value.key, value.params),
};
const LocaleContext = createContext(fallback);
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<UiLocale>('en');
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [locale]);
  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        t: (key, params) => translate(locale, key, params),
        message: (value) =>
          typeof value === 'string'
            ? value
              ? translate(locale, messageKey(value))
              : ''
            : translate(locale, value.key, value.params),
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}
export const useLocale = () => useContext(LocaleContext);
