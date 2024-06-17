import axios, { AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { DeepLTranslateResponse } from '../payload';
import { Translate } from '../translate';
import { addCustomCert } from '../util';

export class DeepLProAPI extends Translate {
  private static readonly endpoint: string = 'api.deepl.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `DeepL-Auth-Key ${argv.key}`,
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath)
      DeepLProAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
  }

  protected callTranslateAPI = async (valuesForTranslation: string[]): Promise<string> => {
    const res = [];
    for (const v of valuesForTranslation) {
      const response = await axios.post(
        `https://${DeepLProAPI.endpoint}/v2/translate`,
        {
          text: [encode(v)],
          target_lang: argv.to,
          source_lang: argv.from,
          preserve_formatting: true,
        },
        DeepLProAPI.axiosConfig,
      );
      res.push(decode((response as DeepLTranslateResponse).data.translations[0].text));
    }
    return res.join(Translate.sentenceDelimiter);
  };
}
