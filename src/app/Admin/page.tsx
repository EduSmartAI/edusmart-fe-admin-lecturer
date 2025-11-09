"use client";

import React from "react";
import { Card, Row, Col, Button } from "antd";
import {
  FileTextOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FundOutlined,
  FormOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

/**
 * Admin Dashboard Component
 * Displays admin overview and management tools
 */
export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to EduSmart Administration Portal
        </p>
      </div>

      {/* Content Management Section */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Content Management
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage learning goals, technologies, surveys, and questions
        </p>
      </div>

      <Row gutter={[24, 24]} className="mb-8">
        {/* Learning Goals */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="shadow-sm hover:shadow-lg transition-all cursor-pointer h-full border-0"
            styles={{ body: { padding: '28px', textAlign: 'center' } }}
            onClick={() => router.push("/Admin/content-management/learning-goals")}
          >
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <FundOutlined className="text-3xl text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Learning Goals
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 min-h-[40px]">
              Manage academic, professional, and skill-based goals
            </p>
            <Button type="primary" block size="large">
              Manage
            </Button>
          </Card>
        </Col>

        {/* Technologies */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="shadow-sm hover:shadow-lg transition-all cursor-pointer h-full border-0"
            styles={{ body: { padding: '28px', textAlign: 'center' } }}
            onClick={() => router.push("/Admin/content-management/technologies")}
          >
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-green-50 dark:bg-green-900/20">
                <AppstoreOutlined className="text-3xl text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Technologies
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 min-h-[40px]">
              Manage frameworks, libraries, tools, and platforms
            </p>
            <Button type="primary" block size="large">
              Manage
            </Button>
          </Card>
        </Col>

        {/* Surveys */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="shadow-sm hover:shadow-lg transition-all cursor-pointer h-full border-0"
            styles={{ body: { padding: '28px', textAlign: 'center' } }}
            onClick={() => router.push("/Admin/content-management/surveys")}
          >
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <FileTextOutlined className="text-3xl text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Surveys
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 min-h-[40px]">
              Create and manage course feedback surveys
            </p>
            <Button type="primary" block size="large">
              Manage
            </Button>
          </Card>
        </Col>

        {/* Questions */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="shadow-sm hover:shadow-lg transition-all cursor-pointer h-full border-0"
            styles={{ body: { padding: '28px', textAlign: 'center' } }}
            onClick={() => router.push("/Admin/content-management/questions")}
          >
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <BarsOutlined className="text-3xl text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Questions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 min-h-[40px]">
              Create and manage reusable survey questions
            </p>
            <Button type="primary" block size="large">
              Manage
            </Button>
          </Card>
        </Col>

        {/* Student Surveys */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="shadow-sm hover:shadow-lg transition-all cursor-pointer h-full border-0"
            styles={{ body: { padding: '28px', textAlign: 'center' } }}
            onClick={() => router.push("/Admin/content-management/student-surveys")}
          >
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                <FormOutlined className="text-3xl text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Student Surveys
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 min-h-[40px]">
              View student survey submissions and results
            </p>
            <Button type="primary" block size="large">
              Manage
            </Button>
          </Card>
        </Col>

        {/* Student Tests */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="shadow-sm hover:shadow-lg transition-all cursor-pointer h-full border-0"
            styles={{ body: { padding: '28px', textAlign: 'center' } }}
            onClick={() => router.push("/Admin/content-management/student-tests")}
          >
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <CheckCircleOutlined className="text-3xl text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Student Tests
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 min-h-[40px]">
              View test results and detailed breakdowns
            </p>
            <Button type="primary" block size="large">
              Manage
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card 
        title={
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Activity
          </span>
        }
        className="shadow-sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          No recent activity to display
        </p>
      </Card>
    </div>
  );
}
