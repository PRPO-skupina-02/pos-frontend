import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

// This instance will be configured in main.ts with the proper baseURL
export const nakupAPI = axios.create()

export const nakupMutator = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = config.baseURL || config.url || ''
  return nakupAPI({ ...config, url: source }).then((res) => res.data as T)
}
