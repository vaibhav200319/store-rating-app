const FormInput = ({ label, id, type = "text", value, onChange, placeholder, required }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
    />
  </div>
);

export default FormInput;
