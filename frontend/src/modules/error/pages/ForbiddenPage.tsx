import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import FadeIn from '@/components/common/FadeIn';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <FadeIn>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Result
          status="403"
          title="403"
          subTitle="抱歉，您没有权限访问该页面"
          extra={
            <Button type="primary" onClick={() => navigate('/dashboard')}>
              返回首页
            </Button>
          }
        />
      </div>
    </FadeIn>
  );
}
