import { useState } from 'react';
import { Upload, Button, Image, Space, App } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUploadFileMutation } from '@/services/adminApi';
import { getApiErrorMessage } from '@/utils/error';

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
  const { message } = App.useApp();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadFile, { isLoading: loading }] = useUploadFileMutation();

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
    try {
      const result = await uploadFile(file as File).unwrap();
      onChange(result.url);
      message.success('上传成功');
      onSuccess?.(result);
    } catch (err: unknown) {
      const messageText = getApiErrorMessage(err, '上传失败');
      message.error(messageText);
      onError?.(new Error(messageText));
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div>
      {value ? (
        <Space orientation="vertical">
          <Image
            src={value}
            width={100}
            height={100}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            preview={{
              open: previewVisible,
              onOpenChange: setPreviewVisible,
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
