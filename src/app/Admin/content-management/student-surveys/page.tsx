import { Metadata } from "next";
import StudentSurveysClient from "./Client";

export const metadata: Metadata = {
  title: "Khảo sát sinh viên | EduSmart Admin",
  description: "Xem danh sách các bài khảo sát sinh viên đã hoàn thành",
};

export default function StudentSurveysPage() {
  return <StudentSurveysClient />;
}
