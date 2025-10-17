import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Plus, Edit, Trash2, Tag, Copy, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([
    {
      id: 'voucher1',
      code: 'NEWYEAR2024',
      description: 'Giảm giá đầu năm 2024',
      discountType: 'percentage',
      discountValue: 30,
      maxUses: 100,
      currentUses: 45,
      expiresAt: '2024-12-31',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: 'voucher2',
      code: 'STUDENT50',
      description: 'Ưu đãi cho học sinh sinh viên',
      discountType: 'fixed',
      discountValue: 500000,
      maxUses: 200,
      currentUses: 123,
      expiresAt: '2024-12-31',
      isActive: true,
      createdAt: '2024-02-15'
    },
    {
      id: 'voucher3',
      code: 'FIRSTTIME20',
      description: 'Giảm giá cho người dùng mới',
      discountType: 'percentage',
      discountValue: 20,
      maxUses: 500,
      currentUses: 287,
      expiresAt: '2024-12-31',
      isActive: true,
      createdAt: '2024-03-10'
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxUses: 100,
    expiresAt: ''
  });

  const handleCreateVoucher = () => {
    if (!newVoucher.code || !newVoucher.description || !newVoucher.expiresAt) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newVoucher.discountValue <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0");
      return;
    }

    if (newVoucher.discountType === 'percentage' && newVoucher.discountValue > 100) {
      toast.error("Phần trăm giảm giá không được vượt quá 100%");
      return;
    }

    if (newVoucher.maxUses < 1) {
      toast.error("Số lượng tối đa phải lớn hơn 0");
      return;
    }

    const voucher = {
      id: 'voucher_' + Date.now(),
      code: newVoucher.code.toUpperCase(),
      description: newVoucher.description,
      discountType: newVoucher.discountType,
      discountValue: parseFloat(newVoucher.discountValue),
      maxUses: parseInt(newVoucher.maxUses),
      currentUses: 0,
      expiresAt: newVoucher.expiresAt,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setVouchers(prev => [...prev, voucher]);
    setNewVoucher({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxUses: 100,
      expiresAt: ''
    });
    setShowCreateDialog(false);
    toast.success("Đã tạo voucher mới");
  };

  const handleToggleVoucher = (voucherId) => {
    setVouchers(prev => prev.map(voucher =>
      voucher.id === voucherId ? { ...voucher, isActive: !voucher.isActive } : voucher
    ));
    toast.success("Đã cập nhật trạng thái voucher");
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã copy mã voucher");
  };

  const handleDeleteVoucher = (voucherId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      setVouchers(prev => prev.filter(v => v.id !== voucherId));
      toast.success("Đã xóa voucher");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDiscount = (type, value) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  const getUsageProgress = (current, max) => {
    const percentage = (current / max) * 100;
    return percentage;
  };

  return (
    <div className="voucher-management">
      <Card className="management-card">
        <CardHeader>
          <div className="header-with-button">
            <div>
              <CardTitle>Quản lý voucher</CardTitle>
              <CardDescription>Tạo, sửa, xóa và quản lý mã giảm giá</CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="create-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo voucher mới
                </Button>
              </DialogTrigger>
              <DialogContent className="create-dialog">
                <DialogHeader>
                  <DialogTitle>Tạo voucher mới</DialogTitle>
                  <DialogDescription>
                    Điền thông tin để tạo mã giảm giá
                  </DialogDescription>
                </DialogHeader>
                <div className="form-fields">
                  <div className="form-field">
                    <Label htmlFor="voucherCode">Mã voucher *</Label>
                    <Input
                      id="voucherCode"
                      placeholder="SUMMER2024"
                      value={newVoucher.code}
                      onChange={(e) => setNewVoucher(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="uppercase"
                    />
                    <p className="field-hint">Chữ in hoa, không dấu, không khoảng trắng</p>
                  </div>
                  <div className="form-field">
                    <Label htmlFor="voucherDescription">Mô tả *</Label>
                    <Textarea
                      id="voucherDescription"
                      placeholder="Mô tả về voucher..."
                      value={newVoucher.description}
                      onChange={(e) => setNewVoucher(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <Label htmlFor="discountType">Loại giảm giá *</Label>
                      <Select 
                        value={newVoucher.discountType} 
                        onValueChange={(value) => setNewVoucher(prev => ({ ...prev, discountType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                          <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-field">
                      <Label htmlFor="discountValue">
                        Giá trị giảm * {newVoucher.discountType === 'percentage' ? '(%)' : '(VNĐ)'}
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        min="0"
                        max={newVoucher.discountType === 'percentage' ? 100 : undefined}
                        placeholder={newVoucher.discountType === 'percentage' ? '20' : '100000'}
                        value={newVoucher.discountValue}
                        onChange={(e) => setNewVoucher(prev => ({ ...prev, discountValue: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <Label htmlFor="maxUses">Số lượng tối đa *</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        min="1"
                        placeholder="100"
                        value={newVoucher.maxUses}
                        onChange={(e) => setNewVoucher(prev => ({ ...prev, maxUses: e.target.value }))}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="expiresAt">Ngày hết hạn *</Label>
                      <Input
                        id="expiresAt"
                        type="date"
                        value={newVoucher.expiresAt}
                        onChange={(e) => setNewVoucher(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="dialog-actions">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateVoucher}>
                    Tạo voucher
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã voucher</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Sử dụng</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher, index) => (
                  <TableRow key={voucher.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <TableCell>
                      <div className="voucher-code-cell">
                        <Tag className="h-4 w-4 text-pink-600" />
                        <span className="voucher-code">{voucher.code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="copy-btn"
                          onClick={() => handleCopyCode(voucher.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="voucher-description">{voucher.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className="discount-badge">
                        {formatDiscount(voucher.discountType, voucher.discountValue)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="usage-cell">
                        <div className="usage-text">
                          {voucher.currentUses} / {voucher.maxUses}
                        </div>
                        <div className="usage-bar">
                          <div 
                            className="usage-progress"
                            style={{ width: `${getUsageProgress(voucher.currentUses, voucher.maxUses)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="expires-cell">
                        <Calendar className="h-4 w-4" />
                        {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="switch-cell">
                        <Switch
                          checked={voucher.isActive}
                          onCheckedChange={() => handleToggleVoucher(voucher.id)}
                        />
                        <span className={voucher.isActive ? 'text-green-600' : 'text-gray-400'}>
                          {voucher.isActive ? 'Kích hoạt' : 'Tắt'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="action-buttons">
                        <Button variant="ghost" size="sm" className="action-btn" title="Sửa">
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="action-btn"
                          onClick={() => handleDeleteVoucher(voucher.id)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
