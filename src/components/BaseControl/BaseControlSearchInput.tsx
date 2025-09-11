// BaseControlSearchInput.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Input,
  List,
  Spin,
  Typography,
  Divider,
  theme,
  InputRef,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";

export type SearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  iconUrl?: string;
};

type Props = {
  placeholder?: string;
  hintLabel?: string; // ví dụ "Ctrl K"
  onSearch: (q: string) => Promise<SearchItem[]>;
  onSelect?: (item: SearchItem) => void;
  initialResults?: SearchItem[];
  className?: string; // style cho ô trigger nhỏ
};

const isMac = () =>
  typeof navigator !== "undefined" &&
  /(Mac|iPhone|iPad|iPod)/i.test(navigator.platform);

export default function BaseControlSearchInput({
  placeholder = "Type keywords...",
  hintLabel,
  onSearch,
  onSelect,
  initialResults = [],
  className = "",
}: Props) {
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchItem[]>(initialResults);
  const [activeIndex, setActiveIndex] = useState(0);

  const triggerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<InputRef | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debTimer = useRef<number | null>(null);

  const kbdLabel = useMemo(
    () => hintLabel ?? (isMac() ? "⌘ K" : "Ctrl K"),
    [hintLabel],
  );

  // Hotkey toàn app
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = isMac() ? e.metaKey : e.ctrlKey;
      if (mod && (e.key.toLowerCase() === "k" || e.code === "KeyK")) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input khi mở modal
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Debounce search
  useEffect(() => {
    if (!open) return;
    if (debTimer.current) window.clearTimeout(debTimer.current);
    debTimer.current = window.setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults(initialResults);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const r = await onSearch(q);
        setResults(r);
        setActiveIndex(0);
      } finally {
        setLoading(false);
      }
    }, 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  // Giữ item active trong viewport
  useEffect(() => {
    const cont = listRef.current;
    const el = cont?.querySelector<HTMLDivElement>(
      `[data-idx="${activeIndex}"]`,
    );
    if (cont && el) {
      const cTop = cont.scrollTop;
      const cBot = cTop + cont.clientHeight;
      const eTop = el.offsetTop;
      const eBot = eTop + el.clientHeight;
      if (eTop < cTop) cont.scrollTop = eTop - 8;
      else if (eBot > cBot) cont.scrollTop = eBot - cont.clientHeight + 8;
    }
  }, [activeIndex]);

  const handleSelect = (item: SearchItem) => {
    onSelect?.(item);
    setOpen(false);
  };

  const onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const item = results[activeIndex];
      if (item) handleSelect(item);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 5, Math.max(results.length - 1, 0)));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 5, 0));
    }
  };

  return (
    <>
      {/* Trigger kiểu ô input nhỏ */}
      <div
        ref={triggerRef}
        role="button"
        onClick={() => setOpen(true)}
        className={[
          "flex items-center gap-8 w-full",
          "rounded-full border",
          "px-3 py-2",
          className || "",
        ].join(" ")}
        style={{
          borderColor: token.colorBorderSecondary,
          background: token.colorBgContainer,
          boxShadow: token.boxShadowSecondary,
          cursor: "text",
        }}
        aria-label="Open search"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
          }}
        >
          <SearchOutlined style={{ color: token.colorTextQuaternary }} />
          <span style={{ color: token.colorTextQuaternary, fontSize: 12 }}>
            {placeholder}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Typography.Text keyboard>{kbdLabel}</Typography.Text>
          </div>
        </div>
      </div>

      {/* Command Palette (Modal) */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        closeIcon={false}
        width={880}
        centered
        styles={{
          mask: { backdropFilter: "blur(3px)" },
          body: { padding: 0 },
          content: {
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: token.boxShadowTertiary,
          },
        }}
      >
        <div style={{ position: "relative" }}>
          {/* ESC pill */}
          <div style={{ position: "absolute", right: 12, top: 12 }}>
            <Typography.Text keyboard>ESC</Typography.Text>
          </div>

          {/* Search input */}
          <div style={{ padding: "16px 16px 8px 16px" }}>
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="What are you looking for?"
              prefix={
                <SearchOutlined style={{ color: token.colorTextQuaternary }} />
              }
              variant="borderless"
              size="large"
              autoFocus
            />
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Results */}
          <div
            ref={listRef}
            style={{ maxHeight: "52vh", overflow: "auto", padding: 8 }}
          >
            {loading && (
              <div style={{ padding: "16px 12px" }}>
                <Spin size="small" />{" "}
                <span style={{ marginLeft: 8, color: token.colorTextTertiary }}>
                  Đang tìm…
                </span>
              </div>
            )}

            {!loading && results.length === 0 && query.trim() !== "" && (
              <div
                style={{ padding: "16px 12px", color: token.colorTextTertiary }}
              >
                Không có kết quả phù hợp.
              </div>
            )}

            {!loading && results.length > 0 && (
              <List
                dataSource={results}
                renderItem={(it, idx) => {
                  const active = idx === activeIndex;
                  return (
                    <List.Item
                      key={it.id}
                      data-idx={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelect(it)}
                      style={{
                        borderRadius: 12,
                        margin: 4,
                        padding: "10px 12px",
                        cursor: "pointer",
                        background: active
                          ? token.colorPrimaryBgHover
                          : undefined,
                        outline: active
                          ? `1px solid ${token.colorPrimaryBorder}`
                          : "none",
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: 999,
                              marginTop: 6,
                              background: active
                                ? token.colorPrimary
                                : token.colorBorderSecondary,
                            }}
                          />
                        }
                        title={
                          <Typography.Text
                            style={{ color: token.colorText }}
                            ellipsis
                            strong={active}
                          >
                            {it.title}
                          </Typography.Text>
                        }
                        description={
                          it.subtitle ? (
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                              ellipsis
                            >
                              {it.subtitle}
                            </Typography.Text>
                          ) : undefined
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
