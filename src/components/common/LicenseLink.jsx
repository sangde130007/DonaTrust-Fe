// src/components/common/LicenseLink.jsx
import React from 'react';
import { toAbsoluteFileUrl, getExt, isImageExt, isWordExt } from '../../utils/fileLink';

const LicenseLink = ({ path, className = '', label }) => {
  if (!path) return <span className={className}>—</span>;

  const url = toAbsoluteFileUrl(path);
  const ext = getExt(url);

  const openImage = (e) => {
    e?.stopPropagation?.();
    window.open(url, '_blank', 'noopener'); // mở tab mới
  };

  const downloadFile = (e) => {
    e?.stopPropagation?.();
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop() || 'license';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Ảnh -> mở tab mới
  if (isImageExt(ext)) {
    return (
      <button
        type="button"
        onClick={openImage}
        className={`text-blue-600 hover:underline ${className}`}
        title="Xem ảnh"
      >
        {label || 'Xem ảnh'}
      </button>
    );
  }

  // Word -> tải về
  if (isWordExt(ext)) {
    return (
      <button
        type="button"
        onClick={downloadFile}
        className={`text-blue-600 hover:underline ${className}`}
        title="Tải về"
      >
        {label || 'Tải về (DOC/DOCX)'}
      </button>
    );
  }

  // Mặc định -> mở tab
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`text-blue-600 hover:underline ${className}`}
      title="Mở tệp"
    >
      {label || 'Mở tệp'}
    </a>
  );
};

export default LicenseLink;
