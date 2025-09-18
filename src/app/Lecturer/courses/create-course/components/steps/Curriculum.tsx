'use client';
import { FC, useState, useEffect } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { ConfigProvider, Input, InputNumber, Button, message, theme, Modal, Form } from 'antd';
import { FaArrowLeft, FaArrowRight, FaPlus, FaTrash, FaBook } from 'react-icons/fa';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';

const Curriculum: FC = () => {
    const { setCurrentStep, modules, addModule, updateModule, removeModule, error, clearError } = useCreateCourseStore();
    const { isDarkMode } = useTheme();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<number | null>(null);

    // Handle error display
    useEffect(() => {
        if (error) {
            message.error(error);
            clearError();
        }
    }, [error]); // Remove clearError from dependencies to prevent infinite loop

    const handleAddModule = () => {
        setEditingIndex(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditModule = (index: number) => {
        const courseModule = modules[index];
        setEditingIndex(index);
        form.setFieldsValue({
            moduleName: courseModule.moduleName,
            description: courseModule.description,
            durationMinutes: courseModule.durationMinutes,
            level: courseModule.level,
            isCore: courseModule.isCore,
        });
        setIsModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            const moduleData = {
                moduleName: values.moduleName,
                description: values.description || '',
                durationMinutes: values.durationMinutes,
                level: values.level || 1,
                isCore: values.isCore || true,
                isActive: true,
                objectives: [],
                lessons: []
            };

            if (editingIndex !== null) {
                updateModule(editingIndex, moduleData);
                message.success('Cập nhật chương thành công!');
            } else {
                addModule(moduleData);
                message.success('Thêm chương thành công!');
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleRemoveModule = (index: number) => {
        setModuleToDelete(index);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (moduleToDelete !== null) {
            removeModule(moduleToDelete);
            message.success('Xóa chương thành công!');
            setDeleteModalVisible(false);
            setModuleToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
        setModuleToDelete(null);
    };

    const handleNext = () => {
        if (modules.length === 0) {
            message.warning('Vui lòng thêm ít nhất một chương học');
            return;
        }
        setCurrentStep(2); // Move to next step
    };

    return (
        <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
            <FadeInUp className="space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Thiết kế chương trình học
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Tạo và tổ chức các chương học cho khóa học của bạn
                    </p>
                </div>

                {/* Module List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                Danh sách chương ({modules.length})
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Tổ chức và chỉnh sửa các chương học của bạn.
                            </p>
                        </div>
                        <Button type="primary" icon={<FaPlus />} onClick={handleAddModule}>
                            Thêm chương
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {modules.map((module, index) => (
                            <div key={module.id || index} 
                                 className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                                Chương {index + 1}: {module.moduleName}
                                            </h4>
                                            {module.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {module.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span>⏱ {module.durationMinutes || 0} phút</span>
                                                <span>📚 {module.lessons?.length || 0} bài học</span>
                                                <span className={module.isCore ? 'text-orange-600' : 'text-gray-500'}>
                                                    {module.isCore ? '🔥 Cốt lõi' : '📖 Tùy chọn'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="small" onClick={() => handleEditModule(index)}>
                                                Chỉnh sửa
                                            </Button>
                                            <Button size="small" danger onClick={() => handleRemoveModule(index)}>
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {modules.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <FaBook className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-4" />
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Chưa có chương học nào
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Hãy bắt đầu bằng cách thêm chương đầu tiên cho khóa học của bạn.
                                </p>
                                <Button type="primary" icon={<FaPlus />} onClick={handleAddModule}>
                                    Thêm chương đầu tiên
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                    <Button size="large" onClick={() => setCurrentStep(0)} icon={<FaArrowLeft />}>
                        Quay lại
                    </Button>
                    <Button type="primary" size="large" onClick={handleNext} icon={<FaArrowRight />}>
                        Tiếp theo
                    </Button>
                </div>

                {/* Add/Edit Module Modal */}
                <Modal
                    title={editingIndex !== null ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    width={600}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            name="moduleName"
                            label="Tên chương"
                            rules={[{ required: true, message: 'Vui lòng nhập tên chương' }]}
                        >
                            <Input placeholder="Ví dụ: Giới thiệu về JavaScript" />
                        </Form.Item>

                        <Form.Item name="description" label="Mô tả">
                            <Input.TextArea 
                                rows={3}
                                placeholder="Mô tả ngắn về nội dung chương này..."
                            />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="durationMinutes" label="Thời lượng (phút)">
                                <InputNumber
                                    min={1}
                                    max={1000}
                                    placeholder="60"
                                    className="w-full"
                                />
                            </Form.Item>

                            <Form.Item name="level" label="Mức độ">
                                <Input placeholder="1-3 (1: Cơ bản, 2: Trung cấp, 3: Nâng cao)" />
                            </Form.Item>
                        </div>

                        <Form.Item name="isCore" valuePropName="checked">
                            <input type="checkbox" className="mr-2" />
                            <span>Chương cốt lõi (bắt buộc)</span>
                        </Form.Item>

                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingIndex !== null ? 'Cập nhật' : 'Thêm chương'}
                            </Button>
                        </div>
                    </Form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    title="Xác nhận xóa chương"
                    open={deleteModalVisible}
                    onOk={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <p>Bạn có chắc chắn muốn xóa chương này không?</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Hành động này không thể hoàn tác và sẽ xóa tất cả bài học trong chương.
                    </p>
                </Modal>
            </FadeInUp>
        </ConfigProvider>
    );
};

export default Curriculum;
