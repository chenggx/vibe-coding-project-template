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
      size="default"
      styles={{ body: { padding: 0 } }}
    >
      <Sidebar collapsed={false} />
    </Drawer>
  );
}
