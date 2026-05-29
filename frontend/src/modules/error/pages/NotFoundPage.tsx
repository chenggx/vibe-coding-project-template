import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import FadeIn from '@/components/common/FadeIn';

export default function NotFoundPage() {
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
          status="404"
          title="404"
          subTitle="抱歉，您访问的页面不存在"
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
