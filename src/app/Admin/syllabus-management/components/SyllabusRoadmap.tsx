"use client";

import { useMemo } from "react";
import { Timeline, Card, Tag, Typography, Tooltip, Badge } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { Syllabus, SyllabusSemester } from "EduSmart/types/syllabus";

const { Title, Text } = Typography;

interface SyllabusRoadmapProps {
  syllabus: Syllabus;
  showCredits?: boolean;
}

export default function SyllabusRoadmap({ syllabus, showCredits = true }: SyllabusRoadmapProps) {
  const sortedSemesters = useMemo(() => {
    return [...syllabus.semesters].sort((a, b) => a.positionIndex - b.positionIndex);
  }, [syllabus.semesters]);

  const totalCredits = useMemo(() => {
    return syllabus.semesters.reduce((total, sem) => {
      return total + sem.subjects.reduce((semTotal, subj) => semTotal + (subj.credit || 0), 0);
    }, 0);
  }, [syllabus.semesters]);

  const totalSubjects = useMemo(() => {
    return syllabus.semesters.reduce((total, sem) => total + sem.subjects.length, 0);
  }, [syllabus.semesters]);

  // Determine semester phase (foundation vs specialized)
  const getSemesterPhase = (positionIndex: number) => {
    if (positionIndex <= 4) return 'foundation';
    return 'specialized';
  };

  return (
    <div className="syllabus-roadmap">
      {/* Header Stats */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!mb-1">
              Roadmap Học tập - {syllabus.versionLabel}
            </Title>
            <Text type="secondary">
              Lộ trình học tập qua các học kỳ
            </Text>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sortedSemesters.length}</div>
              <Text type="secondary" className="text-xs">Học kỳ</Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalSubjects}</div>
              <Text type="secondary" className="text-xs">Môn học</Text>
            </div>
            {showCredits && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{totalCredits}</div>
                <Text type="secondary" className="text-xs">Tín chỉ</Text>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Timeline View */}
      <div className="relative">
        {/* Phase indicators */}
        <div className="flex mb-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <Text className="text-sm">Giai đoạn nền tảng (Kỳ 1-4)</Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <Text className="text-sm">Giai đoạn chuyên ngành (Kỳ 5+)</Text>
          </div>
        </div>

        {/* Timeline */}
        <Timeline
          mode="left"
          items={sortedSemesters.map((semester) => {
            const phase = getSemesterPhase(semester.positionIndex);
            const isFoundation = phase === 'foundation';
            const mandatoryCount = semester.subjects.filter(s => s.isMandatory).length;
            const semesterCredits = semester.subjects.reduce((sum, s) => sum + (s.credit || 0), 0);

            return {
              color: isFoundation ? 'blue' : 'purple',
              dot: isFoundation ? (
                <BookOutlined className="text-blue-500" />
              ) : (
                <StarOutlined className="text-purple-500" />
              ),
              children: (
                <SemesterCard
                  semester={semester}
                  isFoundation={isFoundation}
                  mandatoryCount={mandatoryCount}
                  totalCredits={semesterCredits}
                  showCredits={showCredits}
                />
              ),
            };
          })}
        />
      </div>
    </div>
  );
}

// Semester Card Component
function SemesterCard({
  semester,
  isFoundation,
  mandatoryCount,
  totalCredits,
  showCredits,
}: {
  semester: SyllabusSemester;
  isFoundation: boolean;
  mandatoryCount: number;
  totalCredits: number;
  showCredits: boolean;
}) {
  const sortedSubjects = useMemo(() => {
    return [...semester.subjects].sort((a, b) => a.positionIndex - b.positionIndex);
  }, [semester.subjects]);

  return (
    <Card
      className={`mb-4 transition-all hover:shadow-md ${
        isFoundation ? 'border-l-4 border-l-blue-400' : 'border-l-4 border-l-purple-400'
      }`}
      size="small"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge
            count={semester.positionIndex}
            style={{
              backgroundColor: isFoundation ? '#3b82f6' : '#8b5cf6',
            }}
          />
          <Text strong className="text-lg">{semester.semesterName}</Text>
          <Tag color={isFoundation ? 'blue' : 'purple'} className="text-xs">
            {isFoundation ? 'Nền tảng' : 'Chuyên ngành'}
          </Tag>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Tooltip title="Số môn học">
            <span className="flex items-center gap-1 text-gray-500">
              <BookOutlined />
              {semester.subjects.length}
            </span>
          </Tooltip>
          <Tooltip title="Môn bắt buộc">
            <span className="flex items-center gap-1 text-red-500">
              <CheckCircleOutlined />
              {mandatoryCount}
            </span>
          </Tooltip>
          {showCredits && (
            <Tooltip title="Tổng tín chỉ">
              <span className="flex items-center gap-1 text-orange-500">
                <ClockCircleOutlined />
                {totalCredits} TC
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {sortedSubjects.map((subject) => (
          <Tooltip
            key={subject.subjectId}
            title={
              <div>
                <div>{subject.subjectName}</div>
                {subject.credit && <div>Tín chỉ: {subject.credit}</div>}
                <div>{subject.isMandatory ? 'Bắt buộc' : 'Tự chọn'}</div>
              </div>
            }
          >
            <div
              className={`p-2 rounded-lg text-xs cursor-default transition-colors ${
                subject.isMandatory
                  ? 'bg-red-50 border border-red-200 hover:bg-red-100'
                  : 'bg-green-50 border border-green-200 hover:bg-green-100'
              }`}
            >
              <div className="font-mono font-semibold text-gray-700 truncate">
                {subject.subjectCode}
              </div>
              <div className="text-gray-500 truncate text-xs">
                {subject.subjectName}
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </Card>
  );
}
