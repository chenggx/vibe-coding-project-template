import { useState } from 'react';
import { Upload, Button, Image, Space, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { uploadApi } from '@/modules/upload/api';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  maxSize?: number;
  accept?: string;
}

export default function ImageUploader({
  value,
  onChange,
  maxSize = 2048,
  accept = 'image/jpeg,image/png,image/gif',
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const beforeUpload = (file: File) => {
    const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(
      file.type
    );
    if (!isValidType) {
      message.error('只能上传 JPG、PNG、GIF 格式的图片');
      return false;
    }
    const isValidSize = file.size / 1024 <= maxSize;
    if (!isValidSize) {
      message.error(`图片大小不能超过 ${maxSize}KB`);
      return false;
    }
    return true;
  };

  const handleUpload = async ({
    file,
    onSuccess,
    onError,
  }: {
    file: unknown;
    onSuccess?: (body: unknown) => void;
    onError?: (error: Error) => void;
  }) => {
    setLoading(true);
    try {
      const result = (await uploadApi.uploadFile(file as File)) as unknown as {
        url: string;
      };
      onChange(result.url);
      message.success('上传成功');
      onSuccess?.(result);
    } catch (err: unknown) {
      const messageText = err instanceof Error ? err.message : '上传失败';
      message.error(messageText);
      onError?.(new Error(messageText));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div>
      {value ? (
        <Space direction="vertical">
          <Image
            src={value}
            width={100}
            height={100}
            style={{ objectFit: 'cover', borderRadius: 2 }}
            preview={{
              visible: previewVisible,
              onVisibleChange: setPreviewVisible,
            }}
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleRemove}
            danger
          >
            删除
          </Button>
        </Space>
      ) : (
        <Upload
          accept={accept}
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={({ file, onSuccess, onError }) =>
            handleUpload({ file, onSuccess, onError })
          }
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            上传头像
          </Button>
        </Upload>
      )}
    </div>
  );
}
