import { Drawer } from 'antd';
import Sidebar from './Sidebar';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  return (
    <Drawer
      placement="left"
      onClose={onClose}
      open={open}
      size={220}
      styles={{
        body: { padding: 0, height: '100%', background: 'var(--color-bg-card)' },
        header: { background: 'var(--color-bg-card)' },
        footer: { background: 'var(--color-bg-card)' },
        mask: { borderRadius: 8 },
      }}
    >
      <Sidebar collapsed={false} />
    </Drawer>
  );
}
