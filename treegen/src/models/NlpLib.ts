/**
 * half baked JS libraries for NLP
 * TODO check https://winkjs.org/wink-nlp/collection.html
 */

import natural from "natural"
import WordPOS from "wordpos"
import { Clog } from "../utils/Clog.js"

const clog = new Clog()

export type Term = {
  term: string
  rank: number
}

export class NlpLib {
  wordpos: any

  constructor() {
    this.wordpos = new WordPOS()
  }

  async getNouns(text: string): Promise<string[]> {
    const nouns = await this.wordpos.getNouns(text)
    clog.log("nouns", nouns)
    return nouns
  }

  findTerms(text: string): Term[] {
    // return text.split(" ")
    const TfIdf = natural.TfIdf
    const tfidf = new TfIdf()

    const words = text.split(" ")
    tfidf.addDocument(text)

    // tfidf.tfidfs(['node', 'ruby'], function(i, measure) {
    //     console.log('document #' + i + ' is ' + measure);
    // });
    const terms: Term[] = []
    tfidf.listTerms(0 /*document index*/).forEach(function (item) {
      console.log(item.term + ": " + item.tfidf)
      terms.push({
        term: item.term,
        rank: item.tfidf,
      })
    })

    return terms
  }
}
