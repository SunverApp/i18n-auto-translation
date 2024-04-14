import axios, { AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { Translate } from '../translate';
import { addCustomCert } from '../util';
import { DeepLTranslateResponse } from '../payload';

export class DeepLFreeAPI extends Translate {
  private static readonly endpoint: string = 'api-free.deepl.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `DeepL-Auth-Key ${argv.key}`,
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath)
      DeepLFreeAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
  }

  protected callTranslateAPI = async (valuesForTranslation: string[]): Promise<string> => {
    const res = [];
    for (const v of valuesForTranslation) {
      const response = await axios.post(
        `https://${DeepLFreeAPI.endpoint}/v2/translate`,
        {
          text: [encode(v)],
          target_lang: argv.to,
          source_lang: argv.from,
          preserve_formatting: true,
        },
        DeepLFreeAPI.axiosConfig,
      );
      res.push(decode((response as DeepLTranslateResponse).data.translations[0].text));
    }
    return res.join(Translate.sentenceDelimiter);
  };
}
