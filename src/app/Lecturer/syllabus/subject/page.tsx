"use client";

import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Card, Typography, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { courseServiceAPI } from "EduSmart/api/api-course-service";
import { useNotification } from "EduSmart/Provider/NotificationProvider";

const { Title, Text } = Typography;

interface Subject {
    id: string;
    subjectCode: string;
    subjectName: string;
}

// Mock data
const MOCK_SUBJECTS: Subject[] = [
    { id: "1", subjectCode: "PRN231", subjectName: "Building Cross-Platform Applications" },
    { id: "2", subjectCode: "SWP391", subjectName: "Software Development Project" },
];

export default function LecturerSubjectPage() {
    const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const notification = useNotification();

    const handleCreate = async (values: unknown) => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await courseServiceAPI.syllabus.createSubject(values as any);
            notification.success("Tạo môn học thành công!");

            // Mock update list
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSubjects([...subjects, { id: Date.now().toString(), ...(values as any) }]);

            setIsModalOpen(false);
            form.resetFields();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Create subject error:", error);
            notification.error(error.message || "Tạo môn học thất bại");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Mã",
            dataIndex: "subjectCode",
            key: "subjectCode",
            width: "20%",
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Tên",
            dataIndex: "subjectName",
            key: "subjectName",
            width: "60%",
        },
        {
            title: "Hành động",
            key: "actions",
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
                        <Title level={2}>Quản lý môn học</Title>
                        <Text type="secondary">Tạo và quản lý các môn học.</Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tạo môn học
                    </Button>
                </div>

                <Table
                    dataSource={subjects}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Tạo môn học mới"
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
                        name="subjectCode"
                        label="Mã môn học"
                        rules={[{ required: true, message: "Vui lòng nhập mã môn học" }]}
                    >
                        <Input placeholder="Ví dụ: PRN231" />
                    </Form.Item>
                    <Form.Item
                        name="subjectName"
                        label="Tên môn học"
                        rules={[{ required: true, message: "Vui lòng nhập tên môn học" }]}
                    >
                        <Input placeholder="Ví dụ: Building Cross-Platform Applications" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
