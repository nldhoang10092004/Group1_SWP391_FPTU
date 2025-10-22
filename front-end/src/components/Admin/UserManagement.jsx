import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserCheck, UserX, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    // Mock data
    const mockUsers = [
      {
        id: 'user1',
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        userType: 'student',
        hasActiveSubscription: true,
        isActive: true,
        joinedDate: '2024-01-15',
        lastLogin: '2024-12-26'
      },
      {
        id: 'user2',
        fullName: 'Trần Thị B',
        email: 'tranthib@email.com',
        userType: 'student',
        hasActiveSubscription: false,
        isActive: true,
        joinedDate: '2024-02-10',
        lastLogin: '2024-12-25'
      },
      {
        id: 'user3',
        fullName: 'Lê Văn C',
        email: 'levanc@email.com',
        userType: 'teacher',
        hasActiveSubscription: true,
        isActive: true,
        joinedDate: '2024-01-01',
        lastLogin: '2024-12-26'
      },
      {
        id: 'user4',
        fullName: 'Phạm Thị D',
        email: 'phamthid@email.com',
        userType: 'student',
        hasActiveSubscription: true,
        isActive: false,
        joinedDate: '2024-03-20',
        lastLogin: '2024-12-20'
      },
      {
        id: 'user5',
        fullName: 'Hoàng Văn E',
        email: 'hoangvane@email.com',
        userType: 'student',
        hasActiveSubscription: false,
        isActive: true,
        joinedDate: '2024-05-12',
        lastLogin: '2024-12-26'
      }
    ];
    
    setUsers(mockUsers);
    setIsLoading(false);
  };

  const handleToggleUser = (userId, isActive) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !isActive } : user
    ));
    toast.success(isActive ? "Đã khóa tài khoản" : "Đã kích hoạt tài khoản");
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || user.userType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="user-management">
      <Card className="management-card">
        <CardHeader>
          <CardTitle>Quản lý tài khoản người dùng</CardTitle>
          <CardDescription>Xem, khóa/kích hoạt tài khoản người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="filters-row">
            <div className="search-box">
              <Search className="search-icon" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="filter-select">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="student">Học viên</SelectItem>
                <SelectItem value="teacher">Giảng viên</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Loại tài khoản</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Lần đăng nhập cuối</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow key={user.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <TableCell className="user-name">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`type-badge ${user.userType}`}>
                        {user.userType === 'admin' ? 'Admin' : 
                         user.userType === 'teacher' ? 'Giảng viên' : 'Học viên'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`membership-badge ${user.hasActiveSubscription ? 'active' : 'inactive'}`}>
                        {user.hasActiveSubscription ? '✓ Có' : 'Không'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.joinedDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{new Date(user.lastLogin).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <Badge className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? '✓ Hoạt động' : '✕ Đã khóa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="action-buttons">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUser(user.id, user.isActive)}
                          className="action-btn"
                        >
                          {user.isActive ? 
                            <UserX className="h-4 w-4 text-red-600" /> : 
                            <UserCheck className="h-4 w-4 text-green-600" />
                          }
                        </Button>
                        <Button variant="ghost" size="sm" className="action-btn">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <p>Không tìm thấy người dùng nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
