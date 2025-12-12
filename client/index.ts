/**
 * Copyright (c) Spectro Cloud
 * SPDX-License-Identifier: Apache-2.0
 */

const DEFAULT_BASE_URL = 'https://api.spectrocloud.com';

const getBody = <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return c.json() as Promise<T>;
  }

  if (contentType && contentType.includes('application/octet-stream')) {
    return c.blob() as Promise<T>;
  }

  return c.text() as Promise<T>;
};


const getUrl = (contextUrl: string, baseUrl = DEFAULT_BASE_URL): string => {
  const url = new URL(`${baseUrl}${contextUrl}`);
  const pathname = url.pathname;
  const search = url.search;
  const requestUrl = new URL(`${baseUrl}${pathname}${search}`);

  return requestUrl.toString();
};

export const customFetch = async <T>(
  url: string,
  options: RequestInit & {baseUrl?: string} = {},
): Promise<T> => {
  const requestUrl = getUrl(url, options.baseUrl);

  const requestInit: RequestInit = {
    ...options,
    headers: options.headers,
  };

  const response = await fetch(requestUrl, requestInit);
  const data = await getBody<T>(response);

  return data as T;
};
