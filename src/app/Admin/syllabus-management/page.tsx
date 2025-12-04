import SyllabusManagementClient from "./Client";

export const metadata = {
  title: "Quản lý Chương trình đào tạo | EduSmart Admin",
  description: "Quản lý chương trình đào tạo (Syllabus) cho các khoá sinh viên",
};

export default function SyllabusManagementPage() {
  return <SyllabusManagementClient />;
}
