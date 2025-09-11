"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  Image,
  Input,
  List,
  Pagination,
  Progress,
  Rate,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  ExclamationCircleOutlined,
  FilterOutlined,
  LikeOutlined,
  MessageOutlined,
  PlusOutlined,
  SendOutlined,
  SortAscendingOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { UploadFile } from "antd/lib";

const { Paragraph } = Typography;

function Reply({ r }: { r: ReviewReply }) {
  return (
    <div className="mt-2 pl-10">
      <div className="flex items-start gap-3 rounded-lg bg-white/60 dark:bg-white/5 p-3 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
        <Avatar src={r.avatar} />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{r.by}</span>
            <span className="text-xs text-gray-500">• {r.time}</span>
          </div>
          <div className="text-[13px] text-gray-700 dark:text-gray-300">
            {r.content}
          </div>
        </div>
      </div>
    </div>
  );
}

export type ReviewReply = {
  id: string;
  by: string;
  avatar: string;
  content: string;
  time: string;
};

export type ReviewItem = {
  id: number;
  name: string;
  time: string;
  avatar: string;
  rating: number;
  content: string;
  images?: string[];
  purchased?: boolean;
  helpful: number;
  replies?: ReviewReply[];
};

type Props = {
  /** Điểm trung bình hiển thị ở box trái */
  average?: number;
  /** % breakdown theo thứ tự 5→1 sao (0–100). Mặc định [78,62,44,28,12] */
  breakdownPercentages?: [number, number, number, number, number];
  /** Dữ liệu review ban đầu (mock nếu không truyền) */
  initialReviews?: ReviewItem[];
  /** Số review mỗi trang */
  pageSize?: number;
  /** Hook submit thực sự (nếu có API) */
  onSubmitReview?: (
    rating: number,
    text: string,
    files: UploadFile[],
  ) => Promise<void> | void;
  /** Hook đánh dấu hữu ích */
  onMarkHelpful?: (id: number) => Promise<void> | void;
  /** Hook báo cáo */
  onReport?: (id: number) => Promise<void> | void;
};

export default function CourseReviews({
  average = 4,
  breakdownPercentages = [78, 62, 44, 28, 12],
  initialReviews = [],
  pageSize = 3,
  onSubmitReview,
  onMarkHelpful,
  onReport,
}: Props) {
  // Filters / sort / paging
  const [starFilter, setStarFilter] = useState<number | "all">("all");
  const [hasPhotoOnly, setHasPhotoOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">(
    "newest",
  );
  const [page, setPage] = useState(1);

  // Form
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const filtered = useMemo(() => {
    const base = initialReviews
      .filter((r) => (starFilter === "all" ? true : r.rating === starFilter))
      .filter((r) => (hasPhotoOnly ? (r.images?.length ?? 0) > 0 : true));

    if (sortBy === "highest")
      return [...base].sort((a, b) => b.rating - a.rating);
    if (sortBy === "lowest")
      return [...base].sort((a, b) => a.rating - b.rating);
    return base; // newest: giữ thứ tự demo
  }, [initialReviews, starFilter, hasPhotoOnly, sortBy]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const onClickBar = (s: number) => {
    setStarFilter(s);
    setPage(1);
  };

  const submitReview = async () => {
    if (!myRating || !myText.trim()) {
      message.warning("Chọn sao và nhập nội dung trước khi gửi nhé!");
      return;
    }
    if (onSubmitReview) {
      await onSubmitReview(myRating, myText, fileList);
    } else {
      message.success("Đã gửi đánh giá (demo).");
    }
    setMyRating(0);
    setMyText("");
    setFileList([]);
  };

  const markHelpful = async (id: number) => {
    if (onMarkHelpful) await onMarkHelpful(id);
    else message.success("Đã ghi nhận là hữu ích (demo).");
  };

  const report = async (id: number) => {
    if (onReport) await onReport(id);
    else message.success("Đã báo cáo (demo).");
  };

  return (
    <Card className="rounded-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 bg-cyan-50/80 dark:bg-cyan-950/30">
      {/* Summary + breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
        <div className="md:col-span-1">
          <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-4 sm:p-5 shadow-sm">
            <div className="text-base sm:text-lg font-semibold">
              {average} trên 5
            </div>
            <Rate
              disabled
              defaultValue={Math.round(average)}
              className="!mt-1"
              style={{ fontSize: 16 }}
            />
            <div className="mt-2 text-gray-500 text-sm">Top đánh giá</div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2 sm:space-y-2.5">
          {[5, 4, 3, 2, 1].map((star, idx) => (
            <button
              key={star}
              onClick={() => onClickBar(star)}
              className="group w-full flex items-center gap-3"
            >
              <div className="w-12 text-right text-sm tabular-nums">
                {star} Sao
              </div>
              <Progress
                percent={breakdownPercentages[idx]}
                showInfo={false}
                strokeLinecap="round"
                className="flex-1"
              />
            </button>
          ))}
        </div>
      </div>

      <Divider className="!my-4 sm:!my-6" />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Space wrap>
          <span className="text-sm text-gray-500">
            <FilterOutlined /> Bộ lọc:
          </span>
          {(["all", 5, 4, 3, 2, 1] as const).map((x) => (
            <Button
              key={String(x)}
              size="small"
              type={starFilter === x ? "primary" : "default"}
              onClick={() => {
                setStarFilter(x);
                setPage(1);
              }}
            >
              {x === "all" ? "Tất cả" : `${x}★`}
            </Button>
          ))}
          <Checkbox
            checked={hasPhotoOnly}
            onChange={(e) => {
              setHasPhotoOnly(e.target.checked);
              setPage(1);
            }}
          >
            Có ảnh
          </Checkbox>
        </Space>
        <Space>
          <span className="text-sm text-gray-500">
            <SortAscendingOutlined /> Sắp xếp:
          </span>
          <Select
            size="small"
            value={sortBy}
            style={{ width: 160 }}
            onChange={(v) => setSortBy(v)}
            options={[
              { value: "newest", label: "Mới nhất" },
              { value: "highest", label: "Điểm cao nhất" },
              { value: "lowest", label: "Điểm thấp nhất" },
            ]}
          />
        </Space>
      </div>

      <Divider className="!my-4 sm:!my-6" />

      {/* Write review */}
      <Card
        size="small"
        className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/90 dark:bg-zinc-900/90"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Đánh giá của bạn:</span>
            <Rate value={myRating} onChange={setMyRating} />
          </div>
          <Input.TextArea
            value={myText}
            onChange={(e) => setMyText(e.target.value)}
            rows={3}
            placeholder="Chia sẻ trải nghiệm khóa học…"
          />
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
          >
            <div className="text-xs">
              <PlusOutlined /> Thêm ảnh
            </div>
          </Upload>
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={submitReview}
            >
              Gửi đánh giá
            </Button>
          </div>
        </div>
      </Card>

      <Divider className="!my-4 sm:!my-6" />

      {/* Review list */}
      {paged.length === 0 ? (
        <div className="py-8">
          <Typography.Paragraph className="text-center text-gray-500">
            Chưa có đánh giá phù hợp bộ lọc.
          </Typography.Paragraph>
        </div>
      ) : (
        <List
          itemLayout="vertical"
          size="small"
          split
          dataSource={paged}
          renderItem={(item) => (
            <List.Item key={item.id} className="!px-0">
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} />}
                title={
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{item.name}</span>
                    {item.purchased && (
                      <Tag color="green" icon={<CheckCircleFilled />}>
                        Đã mua
                      </Tag>
                    )}
                    <span className="text-xs text-gray-500">• {item.time}</span>
                  </div>
                }
                description={
                  <Rate
                    disabled
                    defaultValue={item.rating}
                    style={{ fontSize: 14 }}
                  />
                }
              />
              <Paragraph className="!mb-3 text-gray-700 dark:text-gray-300">
                {item.content}
              </Paragraph>

              {!!item.images?.length && (
                <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {item.images.map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt="review-photo"
                      className="rounded-lg"
                    />
                  ))}
                </div>
              )}

              <Space size="small" className="mb-2">
                <Button
                  type="text"
                  icon={<LikeOutlined />}
                  onClick={() => markHelpful(item.id)}
                >
                  Hữu ích ({item.helpful})
                </Button>
                <Button type="text" icon={<MessageOutlined />}>
                  Bình luận
                </Button>
                <Button
                  type="text"
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => report(item.id)}
                >
                  Báo cáo
                </Button>
              </Space>

              {item.replies?.map((r) => (
                <Reply key={r.id} r={r} />
              ))}

              <div className="mt-2 flex items-start gap-2">
                <Avatar src="https://api.dicebear.com/9.x/adventurer/svg?seed=You" />
                <div className="flex-1">
                  <Input.TextArea rows={2} placeholder="Viết bình luận…" />
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="small"
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={() =>
                        message.success("Đã gửi bình luận (demo).")
                      }
                    >
                      Gửi
                    </Button>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}

      <div className="mt-4 flex justify-center">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
          showSizeChanger={false}
        />
      </div>
    </Card>
  );
}
