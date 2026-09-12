import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'

const getSavedLang = (): string => {
  try {
    return localStorage.getItem('i18n_lang') || 'es'
  } catch {
    return 'es'
  }
}

const savedLang = getSavedLang()

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('i18n_lang', lng)
  } catch {
    // localStorage not available (e.g., in test environment)
  }
})

export default i18n
