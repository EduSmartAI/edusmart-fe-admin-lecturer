"use client";

import React from "react";
import { Card, Row, Col, Statistic, Button } from "antd";
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FundOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

/**
 * Admin Dashboard Component
 * Displays admin overview and management tools
 */
export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to EduSmart Administration Portal
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Courses"
              value={0}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Lecturers"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Management Sections */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title="User Management"
            className="h-full flex flex-col"
            extra={
              <Button type="primary" onClick={() => router.push("/Admin/Users")}>
                Manage Users
              </Button>
            }
          >
            <p className="text-gray-600 dark:text-gray-400">
              Manage platform users, roles, and permissions
            </p>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Course Management"
            className="h-full flex flex-col"
            extra={
              <Button type="primary" onClick={() => router.push("/Admin/Courses")}>
                Manage Courses
              </Button>
            }
          >
            <p className="text-gray-600 dark:text-gray-400">
              Review and moderate course content
            </p>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Content Moderation"
            className="h-full flex flex-col"
            extra={
              <Button type="primary" onClick={() => router.push("/Admin/Moderation")}>
                Review Content
              </Button>
            }
          >
            <p className="text-gray-600 dark:text-gray-400">
              Review flagged content and manage violations
            </p>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Platform Settings"
            className="h-full flex flex-col"
            extra={
              <Button type="primary" onClick={() => router.push("/Admin/Settings")}>
                Configure
              </Button>
            }
          >
            <p className="text-gray-600 dark:text-gray-400">
              Configure platform settings and features
            </p>
          </Card>
        </Col>
      </Row>

      {/* Content Management Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Content Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage learning goals, technologies, surveys, and questions
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all hover:shadow-lg"
            onClick={() => router.push("/Admin/content-management/learning-goals")}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">
                <FundOutlined className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Learning Goals
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage academic, professional, and skill-based goals
              </p>
              <Button type="primary" size="small" block>
                Manage
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all hover:shadow-lg"
            onClick={() => router.push("/Admin/content-management/technologies")}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">
                <AppstoreOutlined className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Technologies
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage frameworks, libraries, tools, and platforms
              </p>
              <Button type="primary" size="small" block>
                Manage
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all hover:shadow-lg"
            onClick={() => router.push("/Admin/content-management/surveys")}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">
                <FileTextOutlined className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Surveys
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create and manage course feedback surveys
              </p>
              <Button type="primary" size="small" block>
                Manage
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all hover:shadow-lg"
            onClick={() => router.push("/Admin/content-management/questions")}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">
                <BarsOutlined className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Questions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create and manage reusable survey questions
              </p>
              <Button type="primary" size="small" block>
                Manage
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <p className="text-gray-600 dark:text-gray-400">
          No recent activity to display
        </p>
      </Card>
    </div>
  );
}
