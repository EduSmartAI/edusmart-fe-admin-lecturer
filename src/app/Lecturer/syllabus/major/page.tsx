"use client";

import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Card, Typography, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { courseServiceAPI } from "EduSmart/api/api-course-service";
import { useNotification } from "EduSmart/Provider/NotificationProvider";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Major {
    id: string;
    majorCode: string;
    majorName: string;
    description: string;
}

// Mock data
const MOCK_MAJORS: Major[] = [
    { id: "1", majorCode: "SE", majorName: "Software Engineering", description: "Software development and engineering" },
    { id: "2", majorCode: "AI", majorName: "Artificial Intelligence", description: "AI and Machine Learning" },
];

export default function LecturerMajorPage() {
    const [majors, setMajors] = useState<Major[]>(MOCK_MAJORS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const notification = useNotification();

    const handleCreate = async (values: unknown) => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await courseServiceAPI.syllabus.createMajor(values as any);
            notification.success("Tạo chuyên ngành thành công!");

            // Mock update list
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setMajors([...majors, { id: Date.now().toString(), ...(values as any) }]);

            setIsModalOpen(false);
            form.resetFields();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Create major error:", error);
            notification.error(error.message || "Tạo chuyên ngành thất bại");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Mã",
            dataIndex: "majorCode",
            key: "majorCode",
            width: "15%",
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Tên",
            dataIndex: "majorName",
            key: "majorName",
            width: "25%",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Hành động",
            key: "actions",
            width: "15%",
            render: () => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" />
                    <Button icon={<DeleteOutlined />} size="small" danger />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Title level={2}>Quản lý chuyên ngành</Title>
                        <Text type="secondary">Tạo và quản lý các chuyên ngành đào tạo.</Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tạo chuyên ngành
                    </Button>
                </div>

                <Table
                    dataSource={majors}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Tạo chuyên ngành mới"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
                okText="Tạo"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
                >
                    <Form.Item
                        name="majorCode"
                        label="Mã chuyên ngành"
                        rules={[{ required: true, message: "Vui lòng nhập mã chuyên ngành" }]}
                    >
                        <Input placeholder="Ví dụ: SE" />
                    </Form.Item>
                    <Form.Item
                        name="majorName"
                        label="Tên chuyên ngành"
                        rules={[{ required: true, message: "Vui lòng nhập tên chuyên ngành" }]}
                    >
                        <Input placeholder="Ví dụ: Kỹ thuật phần mềm" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                    >
                        <TextArea rows={4} placeholder="Nhập mô tả chuyên ngành..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
