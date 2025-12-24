'use client';

import React, { useEffect, useState } from "react";
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  DatePicker, 
  Select, 
  Button, 
  Row, 
  Col,
  Modal,
  Descriptions,
  Image as AntImage,
  Empty,
  message
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined,
  TrophyOutlined,
  RiseOutlined
} from "@ant-design/icons";
import { usePaymentStore } from "EduSmart/stores/Payment/PaymentStore";
import { PaymentStatus, PaymentHistoryItemDto } from "EduSmart/api/api-payment-service";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FadeInUp } from "EduSmart/components/Animation/FadeInUp";

const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueDashboard: React.FC = () => {
  const {
    totalAmounts,
    paymentHistory,
    stats,
    isLoading,
    pagination,
    filters,
    fetchTotalAmounts,
    fetchPaymentHistory,
    fetchStats,
    setFilters,
    setPagination,
  } = usePaymentStore();

  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItemDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchTotalAmounts();
    fetchPaymentHistory();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Status tag renderer
  const getStatusTag = (status: PaymentStatus, statusName: string) => {
    const statusConfig: Record<PaymentStatus, { color: string; icon: React.ReactNode }> = {
      [PaymentStatus.Pending]: { color: 'warning', icon: <ClockCircleOutlined /> },
      [PaymentStatus.Paid]: { color: 'success', icon: <CheckCircleOutlined /> },
      [PaymentStatus.Failed]: { color: 'error', icon: <CloseCircleOutlined /> },
      [PaymentStatus.SystemError]: { color: 'error', icon: <CloseCircleOutlined /> },
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {statusName}
      </Tag>
    );
  };

  // Handle view details
  const handleViewDetails = (record: PaymentHistoryItemDto) => {
    setSelectedPayment(record);
    setDetailModalVisible(true);
  };

  // Handle filter change
  const handleStatusChange = (value: PaymentStatus | undefined) => {
    setFilters({ status: value });
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({
        fromDate: dates[0].format('YYYY-MM-DD'),
        toDate: dates[1].format('YYYY-MM-DD'),
      });
    } else {
      setFilters({
        fromDate: undefined,
        toDate: undefined,
      });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      status: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
  };

  const handleRefresh = () => {
    fetchTotalAmounts();
    fetchPaymentHistory();
    fetchStats();
    message.success('Đã làm mới dữ liệu');
  };

  // Table columns
  const columns: ColumnsType<PaymentHistoryItemDto> = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'gatewayTransactionId',
      key: 'gatewayTransactionId',
      width: 180,
      render: (text: string) => (
        <span className="font-mono text-sm">{text}</span>
      ),
    },
    {
      title: 'Khóa học',
      key: 'course',
      width: 300,
      render: (_, record) => {
        const firstItem = record.orderInfo.orderItems[0];
        return (
          <div className="flex items-center gap-3">
            <AntImage
              src={firstItem.courseImageUrlSnapshot}
              alt={firstItem.courseTitleSnapshot}
              width={60}
              height={40}
              className="rounded object-cover"
              preview={false}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{firstItem.courseTitleSnapshot}</div>
              {record.orderInfo.orderItems.length > 1 && (
                <div className="text-xs text-gray-500">+{record.orderInfo.orderItems.length - 1} khóa học khác</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount: number) => (
        <span className="font-bold text-emerald-600">
          {amount.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      filters: [
        { text: 'Đã thanh toán', value: PaymentStatus.Paid },
        { text: 'Đang chờ', value: PaymentStatus.Pending },
        { text: 'Thất bại', value: PaymentStatus.Failed },
        { text: 'Lỗi hệ thống', value: PaymentStatus.SystemError },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: PaymentStatus, record) => getStatusTag(status, record.statusName),
    },
    {
      title: 'Cổng thanh toán',
      dataIndex: 'gateway',
      key: 'gateway',
      width: 120,
      render: (gateway: string) => (
        <Tag color="blue">{gateway}</Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <span className="text-sm">{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <FadeInUp>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Tổng hợp doanh thu
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Quản lý và theo dõi các giao dịch thanh toán
                </p>
              </div>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Làm mới
              </Button>
            </div>
          </div>

          {/* Statistics Cards - Clean & Professional Design */}
          <Row gutter={[20, 20]} className="mb-8">
            {/* Total Revenue Card */}
            <Col xs={24} sm={12} xl={6}>
              <Card 
                className="border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden"
                styles={{ body: { padding: 0 } }}
              >
                <div className="relative overflow-hidden">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20"></div>
                  
                  {/* Content */}
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-3 uppercase tracking-wide">
                          Tổng doanh thu
                        </p>
                        <h3 className="text-gray-900 dark:text-white text-3xl font-bold mb-2">
                          {totalAmounts.toLocaleString('vi-VN')} ₫
                        </h3>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <RiseOutlined className="text-sm" />
                          <span className="text-xs font-medium">Tổng thu từ tất cả giao dịch</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <DollarOutlined className="text-white text-3xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Total Transactions Card */}
            <Col xs={24} sm={12} xl={6}>
              <Card 
                className="border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden"
                styles={{ body: { padding: 0 } }}
              >
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-3 uppercase tracking-wide">
                          Tổng giao dịch
                        </p>
                        <h3 className="text-gray-900 dark:text-white text-4xl font-bold mb-2">
                          {stats.totalTransactions}
                        </h3>
                        <div className="text-blue-600 dark:text-blue-400">
                          <span className="text-xs font-medium">Tất cả các giao dịch</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <ShoppingCartOutlined className="text-white text-3xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Successful Transactions Card */}
            <Col xs={24} sm={12} xl={6}>
              <Card 
                className="border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden"
                styles={{ body: { padding: 0 } }}
              >
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-green-600 dark:text-green-400 text-sm font-semibold mb-3 uppercase tracking-wide">
                          Thành công
                        </p>
                        <h3 className="text-gray-900 dark:text-white text-4xl font-bold mb-2">
                          {stats.successfulTransactions}
                        </h3>
                        <div className="text-green-600 dark:text-green-400">
                          <span className="text-sm font-bold">
                            {stats.totalTransactions > 0 
                              ? `${((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)}%` 
                              : '0%'}
                          </span>
                          <span className="text-xs font-medium ml-2">đã thanh toán</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <CheckCircleOutlined className="text-white text-3xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Pending Transactions Card */}
            <Col xs={24} sm={12} xl={6}>
              <Card 
                className="border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden"
                styles={{ body: { padding: 0 } }}
              >
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold mb-3 uppercase tracking-wide">
                          Đang chờ
                        </p>
                        <h3 className="text-gray-900 dark:text-white text-4xl font-bold mb-2">
                          {stats.pendingTransactions}
                        </h3>
                        <div className="text-amber-600 dark:text-amber-400">
                          <span className="text-sm font-bold">
                            {stats.totalTransactions > 0 
                              ? `${((stats.pendingTransactions / stats.totalTransactions) * 100).toFixed(1)}%` 
                              : '0%'}
                          </span>
                          <span className="text-xs font-medium ml-2">chờ xác nhận</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <ClockCircleOutlined className="text-white text-3xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card className="mb-6 shadow-md border-0 rounded-xl">
            <Space wrap size="middle" className="w-full">
              <div className="flex items-center gap-2">
                <FilterOutlined className="text-emerald-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Bộ lọc:</span>
              </div>
              
              <Select
                placeholder="Trạng thái"
                style={{ width: 180 }}
                allowClear
                value={filters.status}
                onChange={handleStatusChange}
              >
                <Option value={PaymentStatus.Paid}>Đã thanh toán</Option>
                <Option value={PaymentStatus.Pending}>Đang chờ</Option>
                <Option value={PaymentStatus.Failed}>Thất bại</Option>
                <Option value={PaymentStatus.SystemError}>Lỗi hệ thống</Option>
              </Select>

              <RangePicker
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                value={
                  filters.fromDate && filters.toDate
                    ? [dayjs(filters.fromDate), dayjs(filters.toDate)]
                    : null
                }
                onChange={handleDateRangeChange}
              />

              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Card>

          {/* Payment History Table */}
          <Card 
            className="shadow-lg border-0 rounded-2xl"
            title={
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrophyOutlined className="text-white" />
                </div>
                <span className="font-bold text-lg">Lịch sử giao dịch</span>
              </div>
            }
          >
            <Table
              columns={columns}
              dataSource={paymentHistory}
              rowKey="paymentId"
              loading={isLoading}
              pagination={{
                current: pagination.pageNumber,
                pageSize: pagination.pageSize,
                total: pagination.totalCount,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} giao dịch`,
                onChange: (page, pageSize) => setPagination(page, pageSize),
              }}
              scroll={{ x: 1200 }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có giao dịch nào"
                  />
                ),
              }}
            />
          </Card>
        </div>
      </FadeInUp>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <EyeOutlined className="text-white" />
            </div>
            <span className="font-bold">Chi tiết giao dịch</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedPayment && (
          <div className="space-y-6">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã giao dịch" span={2}>
                <span className="font-mono">{selectedPayment.gatewayTransactionId}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedPayment.status, selectedPayment.statusName)}
              </Descriptions.Item>
              <Descriptions.Item label="Cổng thanh toán">
                <Tag color="blue">{selectedPayment.gateway}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền">
                <span className="font-bold text-emerald-600 text-lg">
                  {selectedPayment.amount.toLocaleString('vi-VN')} ₫
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tiền tệ">
                {selectedPayment.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedPayment.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {dayjs(selectedPayment.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              {selectedPayment.returnCode && (
                <Descriptions.Item label="Mã phản hồi" span={2}>
                  {selectedPayment.returnCode}
                </Descriptions.Item>
              )}
              {selectedPayment.returnMessage && (
                <Descriptions.Item label="Thông báo" span={2}>
                  {selectedPayment.returnMessage}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div className="mt-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShoppingCartOutlined className="text-emerald-600" />
                Thông tin đơn hàng
              </h3>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Tổng tiền gốc">
                  {selectedPayment.orderInfo.subtotalAmount.toLocaleString('vi-VN')} ₫
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá">
                  <span className="text-red-500">
                    -{selectedPayment.orderInfo.discountAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Thành tiền">
                  <span className="font-bold text-emerald-600 text-lg">
                    {selectedPayment.orderInfo.finalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức">
                  {selectedPayment.orderInfo.paymentMethod}
                </Descriptions.Item>
                {selectedPayment.orderInfo.paidAt && (
                  <Descriptions.Item label="Ngày thanh toán" span={2}>
                    {dayjs(selectedPayment.orderInfo.paidAt).format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-lg mb-4">Danh sách khóa học</h3>
              <div className="space-y-3">
                {selectedPayment.orderInfo.orderItems.map((item) => (
                  <Card key={item.orderItemId} size="small" className="shadow-sm">
                    <div className="flex gap-4">
                      <AntImage
                        src={item.courseImageUrlSnapshot}
                        alt={item.courseTitleSnapshot}
                        width={100}
                        height={70}
                        className="rounded object-cover"
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{item.courseTitleSnapshot}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Giá gốc:</span>{' '}
                            <span className="line-through">{item.priceSnapshot.toLocaleString('vi-VN')} ₫</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Giá KM:</span>{' '}
                            <span className="text-emerald-600 font-semibold">
                              {item.dealPriceSnapshot.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Số lượng:</span> {item.quantity}
                          </div>
                          <div>
                            <span className="text-gray-500">Thành tiền:</span>{' '}
                            <span className="font-bold text-emerald-600">
                              {item.finalPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RevenueDashboard;

