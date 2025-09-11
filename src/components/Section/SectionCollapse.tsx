// File: src/components/Section/SectionCollapse.tsx
"use client";

import React from "react";
import {
  Collapse,
  Row,
  Col,
  Typography,
  List,
  Checkbox,
  Button,
  Dropdown,
  MenuProps,
} from "antd";
import {
  DownOutlined,
  RightOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Panel } = Collapse;
const { Text } = Typography;

export interface Resource {
  name: string;
  url: string;
}

export interface SectionItem {
  key: string;
  title: string;
  done: boolean;
  duration: string;
  resources?: Resource[];
}

export interface Section {
  key: string;
  title: string;
  completed: number;
  total: number;
  duration: string;
  items?: SectionItem[];
}

interface Props {
  sections: Section[];
  defaultOpenKey?: string;
}

const SectionCollapse: React.FC<Props> = ({ sections, defaultOpenKey }) => {
  const router = useRouter();

  return (
    <Collapse
      accordion
      defaultActiveKey={defaultOpenKey ? [defaultOpenKey] : []}
      expandIconPosition="right"
      expandIcon={({ isActive }) =>
        isActive ? <DownOutlined /> : <RightOutlined />
      }
    >
      {sections.map((sec) => (
        <Panel
          className="bg-[#F6F7F9]"
          key={sec.key}
          header={
            <Row
              justify="space-between"
              align="middle"
              style={{ width: "100%" }}
            >
              <Col className="!h-10 flex items-center">
                <Text strong>{sec.title}</Text>
              </Col>
              <Col>
                <Text type="secondary">
                  {sec.completed}/{sec.total} • {sec.duration}
                </Text>
              </Col>
            </Row>
          }
        >
          {sec.items && (
            <List
              itemLayout="horizontal"
              dataSource={sec.items}
              renderItem={(item) => {
                const resources = item.resources ?? [];
                const menuItems: MenuProps["items"] = resources.map((res) => ({
                  key: res.url,
                  label: (
                    <a
                      href={res.url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                        e.stopPropagation()
                      }
                    >
                      {res.name}
                    </a>
                  ),
                }));

                return (
                  <List.Item
                    key={item.key}
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/lecture/video/${item.key}`)}
                  >
                    <Row
                      className="py-3 hover:bg-gray-200 transition-colors"
                      justify="space-between"
                      align="middle"
                      style={{ width: "100%" }}
                    >
                      <Col>
                        <Checkbox
                          checked={item.done}
                          style={{ marginRight: 8 }}
                        />
                        <Text>{item.title}</Text>
                      </Col>
                      <Col>
                        <Text type="secondary" style={{ marginRight: 16 }}>
                          {item.duration}
                        </Text>
                        {menuItems.length > 0 && (
                          <Dropdown
                            menu={{
                              items: menuItems,
                              onClick: ({ domEvent }) =>
                                domEvent.stopPropagation(),
                            }}
                            trigger={["click"]}
                          >
                            <Button
                              type="link"
                              size="small"
                              icon={<FolderOpenOutlined />}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Resources <DownOutlined />
                            </Button>
                          </Dropdown>
                        )}
                      </Col>
                    </Row>
                  </List.Item>
                );
              }}
            />
          )}
        </Panel>
      ))}
    </Collapse>
  );
};

export default SectionCollapse;
