import { themes } from '../data/themes';

interface ThemeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ThemeSelector = ({ value, onChange }: ThemeSelectorProps) => (
  <label className="grid gap-2">
    <span className="text-sm font-semibold text-slate-200">Tematica</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-md border border-line bg-ink px-3 py-3 text-slate-100 outline-none focus:border-blue-400"
    >
      {themes.map((theme) => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  </label>
);
