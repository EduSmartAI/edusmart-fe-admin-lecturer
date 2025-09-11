"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Table, Input, Space, Tag, Typography, Modal, List, Grid } from "antd";
import type {
  TableColumnsType,
  TablePaginationConfig,
  TableProps,
  InputRef,
} from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export interface BaseControlTableClientProps<
  T extends { key: React.Key } & Record<string, unknown>,
> {
  columns: TableColumnsType<T>;
  data: T[];
  loading?: boolean;

  isShowDescription?: boolean;
  getDescription?: (record: T) => React.ReactNode;

  rowSelectionEnabled?: boolean;
  onRowSelectChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;

  pagination?:
    | false
    | Pick<
        TablePaginationConfig,
        // ✅ bổ sung responsive để không lỗi type
        | "current"
        | "pageSize"
        | "defaultPageSize"
        | "showSizeChanger"
        | "responsive"
      >;

  /** 🔎 Search */
  isShowSearchTable?: boolean;
  searchMode?: "inline" | "palette" | "both";
  searchKeys?: (keyof T | string)[];
  searchPlaceholder?: string;
  initialSearch?: string;
  onSearchChange?: (value: string) => void;

  /** UX */
  showLoadingOnSearch?: boolean;
  showLoadingOnPaginate?: boolean;
  loadingDelayMs?: number;
  disableInputOnExternalLoading?: boolean;

  /** Debounce & rule */
  searchDebounceMs?: number;
  minSearchChars?: number;
  resetPageOnSearch?: boolean;

  /** Palette */
  paletteMaxResults?: number; // default 12
  onPaletteOpenChange?: (open: boolean) => void;
  onPaletteSelect?: (record: T) => void;
  renderPaletteItem?: (record: T) => React.ReactNode;

  /** Bảng có hiển thị loading khi gõ trong palette không? */
  paletteUpdatesTableLoading?: boolean; // default: false
}

/** bỏ dấu & lowercase */
const norm = (s: unknown): string =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Convert unknown → string để tìm kiếm an toàn */
const toSearchableString = (v: unknown): string => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(toSearchableString).join(" ");
  switch (typeof v) {
    case "string":
      return v;
    case "number":
    case "boolean":
      return String(v);
    case "object":
      try {
        return JSON.stringify(v);
      } catch {
        return "";
      }
    default:
      return "";
  }
};

const getStringProp = (
  obj: Record<string, unknown>,
  key: string,
): string | undefined => {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
};

function BaseControlTableClient<
  T extends { key: React.Key } & Record<string, unknown>,
>({
  columns,
  data,
  loading = false,

  isShowDescription = false,
  getDescription,

  rowSelectionEnabled = false,
  onRowSelectChange,

  pagination = { defaultPageSize: 10, showSizeChanger: true },

  // search
  isShowSearchTable = false,
  searchMode = "inline",
  searchKeys,
  searchPlaceholder = "Type keywords…",
  initialSearch = "",
  onSearchChange,

  showLoadingOnSearch = true,
  showLoadingOnPaginate = true,
  loadingDelayMs = 250,
  disableInputOnExternalLoading = false,

  searchDebounceMs = 300,
  minSearchChars = 0,
  resetPageOnSearch = true,

  // palette
  paletteMaxResults = 12,
  onPaletteOpenChange,
  onPaletteSelect,
  renderPaletteItem,
  paletteUpdatesTableLoading = false,
}: BaseControlTableClientProps<T>) {
  /** responsive breakpoints */
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < md

  /** inline text (ô nhỏ) */
  const [searchRawInline, setSearchRawInline] = useState<string>(initialSearch);
  /** palette text (ô lớn trong modal) */
  const [searchRawPalette, setSearchRawPalette] =
    useState<string>(initialSearch);

  /** giá trị đã COMMIT (mới dùng để filter table) */
  const [search, setSearch] = useState<string>(initialSearch);

  // loading tách biệt
  const [innerLoadingInline, setInnerLoadingInline] = useState(false);
  const [innerLoadingPalette, setInnerLoadingPalette] = useState(false);

  const [internalCurrent, setInternalCurrent] = useState<number>(1);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const inputRef = useRef<InputRef>(null);
  const paletteInputRef = useRef<InputRef>(null);

  const debounceInlineRef = useRef<number | null>(null);
  const debouncePaletteRef = useRef<number | null>(null);
  const paginateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (debounceInlineRef.current)
        window.clearTimeout(debounceInlineRef.current);
      if (debouncePaletteRef.current)
        window.clearTimeout(debouncePaletteRef.current);
      if (paginateTimerRef.current)
        window.clearTimeout(paginateTimerRef.current);
    };
  }, []);

  /** Hotkey: Ctrl/Cmd + K → mở palette */
  useEffect(() => {
    if (!isShowSearchTable) return;
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "k") {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowSearchTable]);

  /** Debounce cho ô inline (chỉ chạy khi palette ĐÓNG) → COMMIT vào `search` */
  useEffect(() => {
    if (!isShowSearchTable || paletteOpen) return;

    if (showLoadingOnSearch) setInnerLoadingInline(true);
    if (debounceInlineRef.current)
      window.clearTimeout(debounceInlineRef.current);

    debounceInlineRef.current = window.setTimeout(() => {
      setSearch(searchRawInline);
      onSearchChange?.(searchRawInline);
      if (resetPageOnSearch) setInternalCurrent(1);
      if (showLoadingOnSearch) {
        window.setTimeout(() => setInnerLoadingInline(false), loadingDelayMs);
      }
    }, searchDebounceMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchRawInline,
    isShowSearchTable,
    paletteOpen,
    showLoadingOnSearch,
    searchDebounceMs,
    loadingDelayMs,
    resetPageOnSearch,
  ]);

  /** 🔧 Palette chỉ hiển thị spinner cục bộ khi gõ (không commit `search`) */
  useEffect(() => {
    if (!isShowSearchTable || !paletteOpen) return;
    if (!showLoadingOnSearch) return;

    setInnerLoadingPalette(true);
    if (debouncePaletteRef.current)
      window.clearTimeout(debouncePaletteRef.current);
    debouncePaletteRef.current = window.setTimeout(() => {
      setInnerLoadingPalette(false);
    }, searchDebounceMs);
  }, [
    searchRawPalette,
    isShowSearchTable,
    paletteOpen,
    showLoadingOnSearch,
    searchDebounceMs,
  ]);

  /** util: commit giá trị vào search (dùng cho close palette / select) */
  const commitSearch = (value: string) => {
    const v = value ?? "";
    if (showLoadingOnSearch) setInnerLoadingInline(true);
    setSearch(v);
    onSearchChange?.(v);
    if (resetPageOnSearch) setInternalCurrent(1);
    if (showLoadingOnSearch) {
      window.setTimeout(() => setInnerLoadingInline(false), loadingDelayMs);
    }
  };

  /** lọc data cho TABLE dựa trên `search` đã commit */
  const filteredData = useMemo(() => {
    const needle = search.trim();
    if (!isShowSearchTable || needle === "" || needle.length < minSearchChars)
      return data;

    const q = norm(needle);
    return data.filter((rec) => {
      const keys: ReadonlyArray<string> =
        searchKeys && searchKeys.length > 0
          ? searchKeys.map((k) => String(k))
          : (Object.keys(rec) as string[]);
      return keys.some((k) => {
        const value: unknown = rec[k];
        const text = toSearchableString(value);
        return norm(text).includes(q);
      });
    });
  }, [data, isShowSearchTable, search, searchKeys, minSearchChars]);

  /** 🔧 results cho PALETTE: lọc độc lập theo `searchRawPalette` (không ảnh hưởng table) */
  const paletteResults = useMemo(() => {
    if (!isShowSearchTable) return [];
    const needle = searchRawPalette.trim();
    const source = data;
    if (needle === "" || needle.length < minSearchChars) {
      return source.slice(0, paletteMaxResults);
    }

    const q = norm(needle);
    return source
      .filter((rec) => {
        const keys: ReadonlyArray<string> =
          searchKeys && searchKeys.length > 0
            ? searchKeys.map((k) => String(k))
            : (Object.keys(rec) as string[]);
        return keys.some((k) => {
          const value: unknown = rec[k];
          const text = toSearchableString(value);
          return norm(text).includes(q);
        });
      })
      .slice(0, paletteMaxResults);
  }, [
    data,
    isShowSearchTable,
    searchRawPalette,
    searchKeys,
    minSearchChars,
    paletteMaxResults,
  ]);

  /** pagination hợp nhất */
  const finalPagination = useMemo(() => {
    if (pagination === false) return false;
    const hasExternalCurrent =
      typeof (pagination as TablePaginationConfig).current === "number";
    const base: Partial<TablePaginationConfig> = { ...pagination };

    if (!hasExternalCurrent && resetPageOnSearch) {
      base.current = internalCurrent;
    }

    if (
      !hasExternalCurrent &&
      (searchMode === "palette" || searchMode === "both") &&
      paletteOpen
    ) {
      base.current = 1;
    }

    const pageSizeVal = (pagination as Record<string, unknown>).pageSize;
    const defaultPageSizeVal = (pagination as Record<string, unknown>)
      .defaultPageSize;
    if (
      !hasExternalCurrent &&
      typeof pageSizeVal === "number" &&
      typeof defaultPageSizeVal !== "number"
    ) {
      base.defaultPageSize = pageSizeVal;
      delete (base as Record<string, unknown>).pageSize;
    }
    // responsive pagination (Table sẽ cast đúng)
    (base as TablePaginationConfig).responsive = true;

    return base as Pick<
      TablePaginationConfig,
      | "current"
      | "pageSize"
      | "defaultPageSize"
      | "showSizeChanger"
      | "responsive"
    >;
  }, [pagination, internalCurrent, resetPageOnSearch, paletteOpen, searchMode]);

  /** 🔧 loading cho Table: KHÔNG nhận loading của palette khi palette mở */
  const tableLoading =
    loading ||
    innerLoadingInline ||
    (paletteOpen && paletteUpdatesTableLoading ? innerLoadingPalette : false);

  /** đổi trang/sort/filter → loading ngắn */
  const handleTableChange: TableProps<T>["onChange"] = (pg) => {
    if (!("current" in (pagination || {})) && resetPageOnSearch) {
      setInternalCurrent((pg as TablePaginationConfig).current ?? 1);
    }
    if (showLoadingOnPaginate) {
      if (paginateTimerRef.current)
        window.clearTimeout(paginateTimerRef.current);
      paginateTimerRef.current = window.setTimeout(
        () => undefined,
        loadingDelayMs,
      );
    }
  };

  /** palette open/close */
  const openPalette = () => {
    setPaletteOpen(true);
    setActiveIdx(0);
    setSearchRawPalette(searchRawInline); // copy text hiện tại
    onPaletteOpenChange?.(true);
    setTimeout(() => paletteInputRef.current?.focus(), 0);
  };

  /** 🔧 close + commit giá trị của palette vào `search` rồi mới làm Table loading */
  const closePalette = () => {
    setPaletteOpen(false);
    onPaletteOpenChange?.(false);
    // commit sau một “tick” để đảm bảo modal đóng trước
    const value = searchRawPalette;
    window.setTimeout(() => {
      setSearchRawInline(value);
      commitSearch(value);
    }, 0);
  };

  /** chọn item trong palette → commit + close */
  const selectActive = () => {
    const rec = paletteResults[activeIdx];
    if (!rec) return;
    onPaletteSelect?.(rec);
    const guess =
      getStringProp(rec, "name") ?? toSearchableString(rec).slice(0, 80);
    setSearchRawPalette(guess);
    // Đóng & commit guess
    setPaletteOpen(false);
    onPaletteOpenChange?.(false);
    window.setTimeout(() => {
      setSearchRawInline(guess);
      commitSearch(guess);
    }, 0);
  };

  /** UI kbd badge */
  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <span
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        background: "rgba(0,0,0,0.04)",
        borderRadius: 6,
        padding: "0 6px",
        fontSize: 12,
        lineHeight: "22px",
        color: "rgba(0,0,0,0.45)",
        cursor: "default",
        userSelect: "none",
      }}
    >
      {children}
    </span>
  );

  const showInline =
    isShowSearchTable && (searchMode === "inline" || searchMode === "both");
  const showPaletteTrigger =
    isShowSearchTable && (searchMode === "palette" || searchMode === "both");

  /** số liệu */
  const total = data.length;
  const shown = filteredData.length;
  const hasQuery = isShowSearchTable && search.trim().length > 0;

  /** responsive sizes */
  const inputMaxWidth = isMobile ? "100%" : 420;
  const modalWidth = isMobile ? "96vw" : 720;
  const resultsMaxH = isMobile ? "min(70vh, 420px)" : 420;
  const descMaxWidth = isMobile ? "72vw" : 620;

  return (
    <div>
      {showInline && (
        <div style={{ marginBottom: 12 }}>
          <Space wrap style={{ width: "100%" }}>
            <Input
              ref={inputRef}
              allowClear
              prefix={<SearchOutlined />}
              suffix={
                showPaletteTrigger && !isMobile ? (
                  <span onClick={openPalette} style={{ cursor: "pointer" }}>
                    <Kbd>Ctrl K</Kbd>
                  </span>
                ) : undefined
              }
              placeholder={searchPlaceholder}
              value={searchRawInline}
              disabled={disableInputOnExternalLoading ? loading : false}
              onChange={(e) => setSearchRawInline(e.target.value)}
              onPressEnter={(e) =>
                setSearchRawInline((e.target as HTMLInputElement).value)
              }
              style={{
                width: "100%",
                maxWidth: inputMaxWidth,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            />
            {hasQuery && (
              <Tag color="blue" closable onClose={() => setSearchRawInline("")}>
                “{search.trim()}”
              </Tag>
            )}
            <Text type="secondary">
              {shown.toLocaleString("vi-VN")} / {total.toLocaleString("vi-VN")}{" "}
              kết quả
            </Text>
            {showPaletteTrigger && !isMobile && (
              <Text type="secondary">• Ctrl/Cmd + K</Text>
            )}
          </Space>
        </div>
      )}

      {/* COMMAND PALETTE */}
      {showPaletteTrigger && (
        <Modal
          open={paletteOpen}
          onCancel={closePalette}
          footer={null}
          closable={false}
          width={modalWidth}
          centered
          styles={{
            mask: { backdropFilter: "blur(4px)" },
            content: {
              borderRadius: 12,
              padding: 0,
              overflow: "hidden",
              // bảo đảm không tràn viewport trên mobile
              maxWidth: isMobile ? "96vw" : 720,
            },
          }}
        >
          {/* Header search của palette */}
          <div
            style={{
              padding: isMobile ? "10px 12px" : "12px 16px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              background: "rgba(246,247,249,0.85)",
            }}
          >
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Input
                ref={paletteInputRef}
                size="large"
                bordered={false}
                prefix={<SearchOutlined />}
                placeholder="What are you looking for?"
                value={searchRawPalette}
                onChange={(e) => setSearchRawPalette(e.target.value)}
                suffix={innerLoadingPalette ? <LoadingOutlined /> : undefined}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIdx((i) =>
                      Math.min(i + 1, Math.max(0, paletteResults.length - 1)),
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIdx((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    // nếu chưa có item, commit text hiện tại
                    if (!paletteResults[activeIdx]) {
                      closePalette(); // sẽ commit searchRawPalette
                    } else {
                      selectActive();
                    }
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    closePalette(); // commit-on-close
                  }
                }}
              />
              {!isMobile && <Kbd>esc</Kbd>}
            </Space>
          </div>

          {/* Results */}
          <div
            style={{
              maxHeight: resultsMaxH,
              overflow: "auto",
              padding: isMobile ? 6 : 8,
            }}
          >
            {paletteResults.length ? (
              <List
                dataSource={paletteResults}
                renderItem={(item, idx) => {
                  const name = getStringProp(item, "name") ?? "Record";
                  const desc =
                    getStringProp(item, "description") ??
                    toSearchableString(item).slice(0, 140);
                  return (
                    <List.Item
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={selectActive}
                      style={{
                        borderRadius: 8,
                        margin: isMobile ? 2 : 4,
                        padding: isMobile ? "8px 10px" : "10px 12px",
                        background:
                          idx === activeIdx
                            ? "rgba(24,144,255,0.08)"
                            : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      {renderPaletteItem ? (
                        renderPaletteItem(item)
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background:
                                idx === activeIdx
                                  ? "#1677ff"
                                  : "rgba(0,0,0,0.15)",
                              marginTop: 2,
                              flex: "0 0 auto",
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500 }}>{name}</div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "rgba(0,0,0,0.55)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: descMaxWidth,
                              }}
                              title={toSearchableString(item)}
                            >
                              {desc}
                            </div>
                          </div>
                        </div>
                      )}
                    </List.Item>
                  );
                }}
              />
            ) : (
              <div style={{ padding: 24, color: "rgba(0,0,0,0.45)" }}>
                Không có kết quả phù hợp.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* TABLE */}
      <Table<T>
        rowSelection={
          rowSelectionEnabled ? { onChange: onRowSelectChange } : undefined
        }
        columns={columns}
        dataSource={filteredData}
        // ✅ responsive pagination (đã set trong finalPagination)
        pagination={
          finalPagination === false
            ? false
            : (finalPagination as TablePaginationConfig)
        }
        loading={tableLoading}
        onChange={handleTableChange}
        // ✅ tránh vỡ layout trên mobile nếu nhiều cột
        scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
        tableLayout="auto"
        locale={{
          emptyText:
            isShowSearchTable && search.trim() ? (
              <>
                Không tìm thấy kết quả cho “<b>{search.trim()}</b>”.
              </>
            ) : (
              "Không có dữ liệu"
            ),
        }}
        expandable={
          isShowDescription
            ? {
                expandedRowRender: (record) =>
                  getDescription ? getDescription(record) : null,
                rowExpandable: (record) =>
                  typeof getDescription === "function" &&
                  !!getDescription(record),
              }
            : undefined
        }
        size={isMobile ? "small" : "middle"}
        sticky
      />
    </div>
  );
}

export default BaseControlTableClient;
