import s from './GameCreateView.module.css';
import type { PresetId } from './data/form';

interface PresetOption {
  id: Exclude<PresetId, 'custom'>;
  label: string;
  icon: string;
}

interface Props {
  value: PresetId;
  options: PresetOption[];
  onChange: (preset: Exclude<PresetId, 'custom'>) => void;
}

export function QuickPresets({ value, options, onChange }: Props) {
  return (
    <div className={s.presets} role="radiogroup" aria-label="Quick presets">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${s.preset} ${active ? s.presetActive : ''}`}
            onClick={() => onChange(opt.id)}
          >
            <span aria-hidden="true">{opt.icon}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
