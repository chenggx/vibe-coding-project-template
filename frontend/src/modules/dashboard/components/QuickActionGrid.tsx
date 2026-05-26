import { Button } from 'antd';
import type { ReactNode } from 'react';
import styles from './QuickActionGrid.module.css';

interface QuickAction {
  title: string;
  icon: ReactNode;
  onClick: () => void;
  color?: string;
}

interface QuickActionGridProps {
  actions: QuickAction[];
}

export default function QuickActionGrid({ actions }: QuickActionGridProps) {
  return (
    <div className={styles.grid}>
      {actions.map((action, index) => (
        <Button
          key={index}
          className={styles.button}
          onClick={action.onClick}
          icon={action.icon}
          style={{ color: action.color }}
        >
          {action.title}
        </Button>
      ))}
    </div>
  );
}
