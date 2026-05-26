<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class StorageService
{
    public function upload(UploadedFile $file, string $path = 'images'): string
    {
        $driver = config('filesystems.default', 'local');

        return match ($driver) {
            'oss' => $this->uploadOss($file, $path),
            'qiniu' => $this->uploadQiniu($file, $path),
            default => $this->uploadLocal($file, $path),
        };
    }

    private function uploadLocal(UploadedFile $file, string $path): string
    {
        $filename = Str::uuid()->toString().'.'.$file->guessExtension();
        $storedPath = $file->storeAs($path, $filename, 'public');

        return asset('storage/'.$storedPath);
    }

    private function uploadOss(UploadedFile $file, string $path): string
    {
        throw new \RuntimeException('OSS driver not implemented');
    }

    private function uploadQiniu(UploadedFile $file, string $path): string
    {
        throw new \RuntimeException('Qiniu driver not implemented');
    }
}
