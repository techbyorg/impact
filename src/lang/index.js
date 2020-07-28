import * as _ from 'lodash-es'

import config from '../config'

let files = {
  strings: null,
  paths: null
}

class Language {
  getLangFiles (language) {
    return _.mapValues(files, (val, file) => {
      let languages
      if (!language || (file === 'paths')) {
        languages = config.LANGUAGES
      } else {
        languages = _.uniq([language, 'en'])
      }

      // always need en for fallback
      return _.reduce(languages, (obj, lang) => {
        // be explicit about /lang/ and .json so webpack can strip from prod
        try {
          obj[lang] = require(`../lang/${lang}/${file}_${lang}.json`)
        } catch (error) { console.log(error) }
        if (file === 'strings') {
          // add from frontend-shared
          // be explicit about /lang/ and .json so webpack can strip from prod
          let sharedLang
          try {
            sharedLang = require(`frontend-shared/lang/${lang}/${file}_${lang}.json`)
          } catch (error) { console.log(error) }
          obj[lang] = _.defaults(obj[lang], sharedLang)
        }
        return obj
      }
      , {})
    })
  }

  // used by webpack to concat lang to bundle
  getJsonString = (language) => {
    files = this.getLangFiles(language)

    const str = JSON.stringify(files)
    return `if(typeof window !== 'undefined'){window.languageStrings=${str};} `
  }
}

export default new Language()
