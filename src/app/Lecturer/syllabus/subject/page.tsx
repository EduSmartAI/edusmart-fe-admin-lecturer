"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Card, Typography, Space, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { courseServiceAPI } from "EduSmart/api/api-course-service";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import syllabusServiceAPI, { SubjectDto } from "EduSmart/api/api-syllabus-service";

const { Title, Text } = Typography;

export default function LecturerSubjectPage() {
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const notification = useNotification();

    // Fetch subjects from API
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const response = await syllabusServiceAPI.getAllSubjects(1, 1000);
                if (response.success && response.response) {
                    setSubjects(response.response.items);
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
                notification.error('Không thể tải danh sách môn học');
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, [notification]);

    const handleCreate = async (values: unknown) => {
        setSubmitting(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await courseServiceAPI.syllabus.createSubject(values as any);
            notification.success("Tạo môn học thành công!");

            // Refresh list from API
            const response = await syllabusServiceAPI.getAllSubjects(1, 1000);
            if (response.success && response.response) {
                setSubjects(response.response.items);
            }

            setIsModalOpen(false);
            form.resetFields();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Create subject error:", error);
            notification.error(error.message || "Tạo môn học thất bại");
        } finally {
            setSubmitting(false);
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
            width: "50%",
        },
        {
            title: "Mô tả",
            dataIndex: "subjectDescription",
            key: "subjectDescription",
            width: "20%",
            render: (text: string) => <Text type="secondary">{text || '—'}</Text>,
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

                <Spin spinning={loading}>
                    <Table
                        dataSource={subjects}
                        columns={columns}
                        rowKey="subjectId"
                        pagination={{ pageSize: 10 }}
                    />
                </Spin>
            </Card>

            <Modal
                title="Tạo môn học mới"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={submitting}
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
