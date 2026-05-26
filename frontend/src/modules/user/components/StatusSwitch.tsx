import { Switch } from 'antd';

interface StatusSwitchProps {
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function StatusSwitch({ checked, disabled, onChange }: StatusSwitchProps) {
  return <Switch checked={checked} disabled={disabled} onChange={onChange} size="small" />;
}
