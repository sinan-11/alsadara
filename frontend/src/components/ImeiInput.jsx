import { useRef, useEffect } from 'react';

const ImeiInput = ({ value, onChange, label, placeholder = 'Scan IMEI here', autoFocus = false }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
    onChange(digits);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          inputMode="numeric"
          pattern="[0-9]*"
          spellCheck={false}
          className="input-field font-mono tracking-wider"
        />
        {value.length > 0 && (
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            value.length === 15 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {value.length}/15
          </span>
        )}
      </div>
    </div>
  );
};

export default ImeiInput;
