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
      width="auto"
      closeIcon={null}
      styles={{
        header: { display: 'none' },
        body: { padding: 0, height: '100%' },
      }}
    >
      <Sidebar collapsed={false} />
    </Drawer>
  );
}
