import { GROTHS_IN_BEAM } from '@app/shared/constants';

const API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export const copyToClipboard = (value: string) => {
  let textField = document.createElement('textarea');
  textField.innerText = value;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
};

const addLeadingZeros = (dt) => { 
  return (dt < 10 ? '0' : '') + dt;
}

export const timestampToDate = (value: any, isTimestamp: boolean = false) => {
  const date = new Date(isTimestamp ? value * 1000 : value);
  const hours = date.getHours();
  const dateFormat = MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + ", " +
    addLeadingZeros(hours) + ":" + addLeadingZeros(date.getMinutes()) + ":" + addLeadingZeros(date.getSeconds()) + 
    " " + (hours >= 12 ? 'PM' : 'AM');

  return dateFormat;
};

export function compact(value: string, stringLength: number = 5): string {
  if (value.length <= 11) {
    return value;
  }
  return `${value.substr(0, stringLength)}…${value.substr(-stringLength, stringLength)}`;
}

export const formatActiveAddressString = (value: string = '') => {
  return value.length > 0 ? value.substring(0, 6) 
  + "..." + value.substring(value.length - 6, value.length) : ''
};

const LENGTH_MAX = 8;

export function truncate(value: string): string {
  if (!value) {
    return '';
  }

  if (value.length <= LENGTH_MAX) {
    return value;
  }

  return `${value.slice(0, LENGTH_MAX)}…`;
}

export function toUSD(amount: number, rate: number): string {
  const value = amount * rate;
  switch (true) {
    case amount === 0 || Number.isNaN(amount):
      return '0 USD';
    case value > 0.011: {
      return `${value.toFixed(2)} USD`;
    }
    default:
      return '< 1 cent';
  }
}

export function calcVotingPower(value: number, fullValue: number) {
  if (!value || value == 0) {
    return 0;
  }

  const power = Number((100 / (fullValue / value)).toFixed(2));
  if (power < 1) {
    return '< 1';
  }

  return power;
}

export function fromGroths(value: number): number {
  return value && value !== 0 ? value / GROTHS_IN_BEAM : 0;
}

export function toGroths(value: number): number {
  return value > 0 ? Math.floor(value * GROTHS_IN_BEAM) : 0;
}

export function getSign(positive: boolean): string {
  return positive ? '+ ' : '- ';
}

export function Base64DecodeUrl(str){
  if (str.length % 4 != 0)
    str += ('===').slice(0, 4 - (str.length % 4));
  return str.replace(/-/g, '+').replace(/_/g, '/');
}

export function Base64EncodeUrl(str){
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

export function openInNewTab (url) {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export function numFormatter(num) {
  if (num > 999 && num < 1000000) {
      return parseFloat((num / 1000).toFixed(2)) + 'K';  
  } else if (num >= 1000000) {
      return parseFloat((num / 1000000).toFixed(2)) + 'M';
  } else if (num <= 999){
      return parseFloat(num.toFixed(2));
  }
}

async function loadRate (rate_id: string) {
  const response = await fetch(`${API_URL}?ids=${rate_id}&vs_currencies=usd`, {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin':'*'
    }
  });
  const promise: Promise<any> = response.json();
  return promise;
}

export function parseMetadata(metadata) {
  const splittedMetadata = metadata.split(';');
  splittedMetadata.shift();
  const obj = splittedMetadata.reduce((accumulator, value, index) => {
    const data = value.split(/=(.*)/s);
    return {...accumulator, [data[0]]: data[1]};
  }, {});
  return obj;
}