// src/utils/fileLink.js
const API_ORIGIN =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_ORIGIN) ||
  'http://localhost:5000';

export const toAbsoluteFileUrl = (u) => {
  if (!u) return '';
  let s = String(u).trim().replace(/\\/g, '/');

  // full http(s)
  if (/^https?:\/\//i.test(s)) return s;

  // bắt đầu bằng /uploads -> gắn origin
  if (s.startsWith('/uploads/')) return `${API_ORIGIN}${s}`;

  // tên file trơ -> coi như nằm trong /uploads
  if (!s.startsWith('/')) s = `/uploads/${s}`;

  return `${API_ORIGIN}${s}`;
};

export const getExt = (url) => {
  if (!url) return '';
  const clean = url.split('?')[0].split('#')[0];
  const m = clean.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : '';
};

export const isImageExt = (ext) =>
  ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext);

export const isWordExt = (ext) => ['doc', 'docx'].includes(ext);
