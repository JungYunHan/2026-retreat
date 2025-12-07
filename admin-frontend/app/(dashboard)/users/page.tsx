'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, KeyRound, Search } from 'lucide-react';
import { User, CreateUserRequest, UpdateUserRequest } from '@/lib/types';
import { userApi } from '@/lib/api';
import { getCurrentUsername } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import UserDialog from '@/components/users/UserDialog';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';
import ResetPasswordDialog from '@/components/users/ResetPasswordDialog';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUsername(getCurrentUsername());
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const response = await userApi.getAll();
    if (response.success && response.data) {
      setUsers(response.data);
      setFilteredUsers(response.data);
    } else {
      setError(response.error || '사용자 목록을 불러오는데 실패했습니다.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phoneNumber.includes(searchTerm) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.teamName && user.teamName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleCreate = () => {
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  const handleUserSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    if (selectedUser) {
      const response = await userApi.update(selectedUser.id, data as UpdateUserRequest);
      if (!response.success) {
        alert(response.error || '수정에 실패했습니다.');
        return;
      }
    } else {
      const response = await userApi.create(data as CreateUserRequest);
      if (!response.success) {
        alert(response.error || '생성에 실패했습니다.');
        return;
      }
    }
    fetchUsers();
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      const response = await userApi.delete(selectedUser.id);
      if (!response.success) {
        alert(response.error || '삭제에 실패했습니다.');
        return;
      }
      fetchUsers();
    }
  };

  const handleResetPasswordSubmit = async (newPassword: string) => {
    if (selectedUser) {
      const response = await userApi.resetPassword(selectedUser.id, newPassword);
      if (!response.success) {
        alert(response.error || '비밀번호 초기화에 실패했습니다.');
        return;
      }
      alert('비밀번호가 초기화되었습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground">총 {users.length}명의 사용자</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          사용자 추가
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름, 아이디, 전화번호, 이메일, 팀으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>아이디</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>전화번호</TableHead>
              <TableHead>성별</TableHead>
              <TableHead>팀</TableHead>
              <TableHead>권한</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>{user.teamName || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        title="수정"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResetPassword(user)}
                        title="비밀번호 초기화"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      {user.username !== currentUsername && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          title="삭제"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={selectedUser}
        onSubmit={handleUserSubmit}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userName={selectedUser?.name || ''}
        onConfirm={handleDeleteConfirm}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        userName={selectedUser?.name || ''}
        onSubmit={handleResetPasswordSubmit}
      />
    </div>
  );
}
