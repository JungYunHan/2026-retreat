'use client';

import { useEffect, useState } from 'react';
import { User, CreateUserRequest, UpdateUserRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
}

export default function UserDialog({ open, onOpenChange, user, onSubmit }: UserDialogProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phoneNumber: '',
    gender: '남',
    birthDate: '',
    email: '',
    role: 'USER',
    teamName: '',
    position: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '',
        name: user.name,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        birthDate: user.birthDate || '',
        email: user.email || '',
        role: user.role,
        teamName: user.teamName || '',
        position: user.position || '',
      });
    } else {
      setFormData({
        username: '',
        password: '',
        name: '',
        phoneNumber: '',
        gender: '남',
        birthDate: '',
        email: '',
        role: 'USER',
        teamName: '',
        position: '',
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode) {
        const updateData: UpdateUserRequest = {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          birthDate: formData.birthDate || undefined,
          email: formData.email || undefined,
          role: formData.role,
          teamName: formData.teamName || undefined,
          position: formData.position || undefined,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateUserRequest = {
          username: formData.username,
          password: formData.password,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          birthDate: formData.birthDate || undefined,
          email: formData.email || undefined,
          role: formData.role,
          teamName: formData.teamName || undefined,
          position: formData.position || undefined,
        };
        await onSubmit(createData);
      }
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? '사용자 수정' : '사용자 추가'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? '사용자 정보를 수정합니다.' : '새로운 사용자를 추가합니다.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">아이디 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isEditMode}
                  required={!isEditMode}
                />
              </div>
              {!isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호 *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">전화번호 *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="010-1234-5678"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">성별 *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="성별 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="남">남</SelectItem>
                    <SelectItem value="여">여</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">생년월일</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">권한</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="권한 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamName">팀</Label>
                <Input
                  id="teamName"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">직책</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : isEditMode ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
