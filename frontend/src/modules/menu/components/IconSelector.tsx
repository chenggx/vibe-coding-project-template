import { Select } from 'antd';
import { AVAILABLE_ICONS } from '../iconConfig';

interface IconSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function IconSelector({ value, onChange }: IconSelectorProps) {
  const selected = AVAILABLE_ICONS.find((i) => i.name === value);

  return (
    <Select
      placeholder="请选择图标"
      allowClear
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
      virtual={false}
      options={AVAILABLE_ICONS.map((icon) => {
        const IconComponent = icon.component;
        return {
          value: icon.name,
          label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconComponent />
              {icon.name}
            </span>
          ),
        };
      })}
      labelRender={(props) => {
        if (!selected) return <span>{props.value}</span>;
        const IconComponent = selected.component;
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconComponent />
            {props.value}
          </span>
        );
      }}
    />
  );
}
