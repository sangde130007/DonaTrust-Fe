import React from 'react';

const CheckBox = ({
  label = 'Keep me logged in',
  checked = false,
  onChange,
  id = 'checkbox',
  indeterminate = false,
  disabled = false,
}) => {
  const inputRef = React.useRef(null);

  // Set trạng thái indeterminate (nếu dùng)
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate && !checked;
    }
  }, [indeterminate, checked]);

  return (
    <div className="flex flex-row items-start select-none">
      <div
        className={`relative w-6 h-6 flex-shrink-0 ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {/* Input ở trên cùng để nhận click */}
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          checked={checked}
          onChange={disabled ? undefined : onChange}
          className="absolute inset-0 w-full h-full opacity-0 z-10"
          aria-checked={indeterminate ? 'mixed' : checked}
          disabled={disabled}
        />

        {/* Nền ô checkbox */}
        <img
          src="/images/img_square.svg"
          alt=""
          className="w-6 h-6 pointer-events-none"
        />

        {/* Dấu tick */}
        {checked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3 h-3 bg-button-4 rounded-sm" />
          </div>
        )}

        {/* Vạch “lửng” khi indeterminate (tuỳ bạn có dùng không) */}
        {!checked && indeterminate && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3 h-0.5 bg-button-4 rounded-sm" />
          </div>
        )}
      </div>

      {/* Nhấn label cũng toggle */}
      <label
        htmlFor={id}
        className={`text-base font-inter font-medium text-checkbox-1 ml-[10px] leading-5 whitespace-normal ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export default CheckBox;
