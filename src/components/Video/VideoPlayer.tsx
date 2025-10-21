"use client";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// ✅ chỉ import type để safe với SSR
import type Plyr from "plyr";
import type Hls from "hls.js";
import type {
  ManifestParsedData,
  LevelSwitchedData,
  FragBufferedData,
} from "hls.js";
import "plyr/dist/plyr.css";

import styles from "EduSmart/components/Video/styles/VideoPlayer.module.css";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { createPortal } from "react-dom";

// Bổ sung type cho field không có trong định nghĩa
declare module "hls.js" {
  interface Hls {
    subtitleDisplay?: boolean;
    subtitleTrack?: number;
  }
}

export type PauseReason = "user" | "quality-switch" | "overlay" | "unknown";

type TimedOverlay = {
  /** thời điểm bắt đầu (giây) */
  start: number;
  /** thời điểm kết thúc (giây) – nếu không truyền mà có durationSec thì end = start + durationSec */
  end?: number;
  /** hiển thị trong X giây kể từ start (tuỳ chọn, nếu có sẽ tính end = start + durationSec) */
  durationSec?: number;
  /** nội dung overlay (truyền thẻ div/ReactNode từ ngoài vào) */
  content:
    | ReactNode
    | ((api: {
        close: () => void;
        video: HTMLVideoElement | null;
      }) => ReactNode);
  /** style/position tuỳ chọn */
  className?: string;
  style?: CSSProperties;
  /** id tuỳ chọn */
  id?: string;
  pauseOnShow?: boolean; // 🔵 NEW
  // Có hiển thị nền mờ không (mặc định true)
  backdrop?: boolean;
};

type Props = {
  src: string;
  poster?: string;
  /** Link .vtt bên ngoài (Cloudinary raw) */
  urlVtt?: string;
  onPause?: (info: {
    currentTime: number;
    duration: number;
    reason: PauseReason;
  }) => void;
  onResume?: (info: {
    pausedForMs: number;
    reason: PauseReason;
    resumedAt: number;
  }) => void;
  timedOverlays?: TimedOverlay[];
};

type PlyrQualityOption = {
  default?: number;
  options?: number[];
  forced?: boolean;
  onChange?: (quality: number) => void;
};

type PlyrUrlsOption = { download?: string };

type ExtendedPlyrOptions = Plyr.Options & {
  quality?: PlyrQualityOption;
  urls?: PlyrUrlsOption;
};

type PlyrWithQuality = Plyr & { quality: number };
type PlyrWithLanguage = Plyr & { language: string };

export default function YouTubeStylePlayer({
  src,
  poster,
  urlVtt,
  onPause,
  onResume,
  timedOverlays = [],
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<HTMLTrackElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const [switching, setSwitching] = useState(false);
  const [vttBlobUrl, setVttBlobUrl] = useState<string | null>(null);
  const vttObjectUrlRef = useRef<string | null>(null);
  const [vttBuster, setVttBuster] = useState(0);
  const pauseReasonRef = useRef<PauseReason | null>(null);
  const ignoreFirstQualityChangeRef = useRef(true);
  const seekingRef = useRef(false);
  const lastSeekTsRef = useRef(0);
  const pauseTimerRef = useRef<number | null>(null);
  const PAUSE_SEEK_GRACE = 400; // ms: khoảng “ân hạn” sau khi seek
  const pendingPauseReasonRef = useRef<PauseReason | null>(null);
  const pausePendingRef = useRef(false);
  const lastPauseTsRef = useRef(0);
  const pausedSinceRef = useRef<number | null>(null);
  const lastPauseReasonCommittedRef = useRef<PauseReason | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const pausedByOverlayRef = useRef<Set<string>>(new Set());
  const [plyrContainerEl, setPlyrContainerEl] = useState<HTMLElement | null>(
    null,
  );

  const getOverlayEnd = (ov: TimedOverlay) =>
    typeof ov.end === "number"
      ? ov.end
      : typeof ov.durationSec === "number"
        ? ov.start + ov.durationSec
        : undefined;

  const activeOverlays = useMemo(() => {
    return (timedOverlays ?? []).filter((ov) => {
      const end = getOverlayEnd(ov);
      const isActive =
        end == null
          ? currentTime >= ov.start
          : currentTime >= ov.start && currentTime < end;
      if (!isActive) return false;
      // bỏ qua overlay đã đóng
      const id = ov.id ?? "";
      if (id && dismissedIds.has(id)) return false;
      return true;
    });
  }, [timedOverlays, currentTime, dismissedIds]);

  const closeOverlay = useCallback((idOrIdx: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(idOrIdx);
      return next;
    });
    const v = videoRef.current;
    if (v && v.paused) v.play().catch(() => {});
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // gỡ cờ những overlay không còn active
    const activeKeys = new Set(
      activeOverlays.map((ov, idx) => String(ov.id ?? idx)),
    );
    [...pausedByOverlayRef.current].forEach((k) => {
      if (!activeKeys.has(k)) pausedByOverlayRef.current.delete(k);
    });

    activeOverlays.forEach((ov, idx) => {
      if (!ov.pauseOnShow) return;
      const key = String(ov.id ?? idx);
      if (pausedByOverlayRef.current.has(key)) return;
      // đánh dấu reason để handlePause ghi nhận là 'overlay'
      pauseReasonRef.current = "overlay";
      v.pause();
      pausedByOverlayRef.current.add(key);
    });
  }, [activeOverlays]);

  // Bật đúng track ngoài sau khi track đã load
  const onTrackLoad = () => {
    const v = videoRef.current;
    if (!v) return;
    const tt = v.textTracks;

    // Chọn track tiếng Việt nếu có, nếu không chọn track đầu tiên
    let targetIndex = -1;
    for (let i = 0; i < tt.length; i++) {
      const t = tt[i];
      const lang = (t.language || "").toLowerCase();
      const label = (t.label || "").toLowerCase();
      const isVi =
        lang === "vi" || label.includes("việt") || label.includes("vietnam");
      if (isVi && targetIndex === -1) targetIndex = i;
    }
    if (targetIndex === -1 && tt.length > 0) targetIndex = 0;

    // Buộc reflow: đặt hidden rồi mới showing để đảm bảo render lại cue
    for (let i = 0; i < tt.length; i++) {
      tt[i].mode = i === targetIndex ? "hidden" : "disabled";
    }
    setTimeout(() => {
      const v2 = videoRef.current;
      if (!v2) return;
      const tt2 = v2.textTracks;
      if (targetIndex >= 0 && tt2[targetIndex])
        tt2[targetIndex].mode = "showing";
    }, 0);
    // Nếu chưa tìm thấy -> để browser dùng default, Plyr vẫn hiện CC
    try {
      plyrRef.current?.toggleCaptions(true);
    } catch {}

    // debug nhanh (có thể bỏ):
        
  };

  const onTrackError = () => {
    // Thử bust cache và trigger remount nếu lỗi
    setVttBuster((prev) => prev + 1);
  };

  useEffect(() => {
    let mounted = true;
    const preferExternal = !!urlVtt;

    (async () => {
      const PlyrCtor = (await import("plyr")).default;
      const { default: HlsClass, Events } = await import("hls.js");
      const video = videoRef.current;
      if (!mounted || !video) return;

      let plyr: Plyr | null = null;

      if (HlsClass.isSupported()) {
        const hls = new HlsClass({
          startLevel: -1,
          capLevelToPlayerSize: false,
          maxBufferLength: 10,
          maxMaxBufferLength: 30,
          backBufferLength: 10,
          // Không ép render native text của HLS để tránh xung đột với track ngoài
          enableWebVTT: true,
          enableIMSC1: true,
        }) as Hls;

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        // External-only → tắt mọi thứ phụ đề của HLS để không chồng chéo
        if (preferExternal) {
          try {
            hls.subtitleDisplay = false;
          } catch {}
          try {
            hls.subtitleTrack = -1;
          } catch {}
        }

        hls.on(Events.MANIFEST_PARSED, (_e, data: ManifestParsedData) => {
          const heights = [
            ...new Set(
              (data.levels || []).map((l) => l.height).filter(Boolean),
            ),
          ].sort((a, b) => (b ?? 0) - (a ?? 0));

          const options: ExtendedPlyrOptions = {
            ratio: "16:9",
            seekTime: 10,
            controls: [
              "play-large",
              "restart",
              "rewind",
              "play",
              "fast-forward",
              "progress",
              "current-time",
              "duration",
              "mute",
              "volume",
              "captions",
              "settings",
              "pip",
              "airplay",
              "download",
              "fullscreen",
            ],
            settings: ["captions", "quality", "speed", "loop"],
            speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
            captions: {
              active: true,
              language: preferExternal ? "vi" : "auto",
              update: true,
            },
            i18n: {
              settings: "Cài đặt",
              quality: "Chất lượng",
              speed: "Tốc độ phát",
              captions: "Phụ đề",
            },
            urls: { download: src },
            fullscreen: { enabled: true, fallback: true, iosNative: true },
            storage: { enabled: false },
            quality: {
              default: 0,
              options: [0, ...heights],
              forced: true,
              onChange: (q: number) => {
                const v = videoRef.current!;

                if (ignoreFirstQualityChangeRef.current) {
                  ignoreFirstQualityChangeRef.current = false;
                  // sync UI nếu cần
                  try {
                    (plyrRef.current as PlyrWithQuality | null)!.quality =
                      q || 0;
                  } catch {}
                  return;
                }

                const t = v.currentTime;
                const wasPaused = v.paused;

                setSwitching(true);
                if (!wasPaused) {
                  pauseReasonRef.current = "quality-switch";
                  v.pause(); // sẽ phát sinh 'pause'
                } else {
                  // đang paused sẵn → KHÔNG gắn cờ để tránh rò rỉ sang lần pause của user
                  pauseReasonRef.current = null;
                }

                let targetIdx = -1;
                if (q === 0) {
                  hls.currentLevel = -1; // Auto
                } else {
                  targetIdx = hls.levels.findIndex((l) => l.height === q);
                  if (targetIdx < 0) targetIdx = 0;
                  hls.currentLevel = targetIdx;
                }

                const onFragBuffered = (
                  _ev: unknown,
                  fragData: FragBufferedData,
                ) => {
                  if (fragData?.frag?.type !== "main") return;
                  if (targetIdx !== -1 && fragData.frag.level !== targetIdx)
                    return;
                  hls.off(Events.FRAG_BUFFERED, onFragBuffered);
                  v.currentTime = t;
                  setTimeout(() => {
                    if (!wasPaused) v.play().catch(() => {});
                    setSwitching(false);
                  }, 0);
                };
                hls.on(Events.FRAG_BUFFERED, onFragBuffered);
              },
            },
          };

          plyr = new PlyrCtor(video, options) as Plyr;
          plyrRef.current = plyr;

          const container = (plyr as Plyr)?.elements?.container as
            | HTMLElement
            | undefined;
          setPlyrContainerEl(container ?? video.parentElement ?? null);

          plyr.on?.("ready", () => {
            try {
              if (preferExternal) {
                // Ưu tiên ngôn ngữ phụ đề tiếng Việt nếu có
                try {
                  (plyrRef.current as PlyrWithLanguage).language = "vi";
                } catch {}
              }
              plyrRef.current?.toggleCaptions(true);
            } catch {}
            if (preferExternal) {
              const tr = trackRef.current;
              // 2 = HTMLTrackElement.LOADED
              if (tr && tr.readyState === 2) onTrackLoad();
              // nếu chưa loaded, onTrackLoad sẽ tự chạy khi <track> fire 'load'
              // chạy lại 1 lần sau tick để chắc chắn render
              setTimeout(() => onTrackLoad(), 50);
              setTimeout(() => onTrackLoad(), 250);
            }
          });

          // Sau khi manifest parse xong, đảm bảo HLS không bật subtitle nội bộ
          if (preferExternal) {
            try {
              hls.subtitleDisplay = false;
            } catch {}
            try {
              hls.subtitleTrack = -1;
            } catch {}
          }
        });

        hls.on(Events.LEVEL_SWITCHED, (_e, d: LevelSwitchedData) => {
          const h = hls.levels?.[d.level]?.height ?? 0;
          if (plyr) (plyr as PlyrWithQuality).quality = h || 0;
        });

        // ❌ Không đăng ký SUBTITLE_TRACKS_* (external-only)
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        video.src = src;
        plyr = new PlyrCtor(video, {
          controls: [
            "play",
            "progress",
            "mute",
            "volume",
            "captions",
            "settings",
            "fullscreen",
          ],
          captions: {
            active: true,
            language: preferExternal ? "vi" : "auto",
            update: true,
          },
          i18n: {
            settings: "Cài đặt",
            quality: "Chất lượng",
            speed: "Tốc độ phát",
            captions: "Phụ đề",
          },
          fullscreen: { enabled: true, fallback: true, iosNative: true },
          storage: { enabled: false },
        }) as Plyr;
        plyrRef.current = plyr;
        const containerFallback = (plyr as Plyr)?.elements?.container as
          | HTMLElement
          | undefined;
        setPlyrContainerEl(containerFallback ?? video.parentElement ?? null);
        plyr.on?.("ready", () => {
          try {
            if (preferExternal) {
              try {
                (plyrRef.current as PlyrWithLanguage).language = "vi";
              } catch {}
            }
            plyrRef.current?.toggleCaptions(true);
          } catch {}
          if (preferExternal) {
            const tr = trackRef.current;
            if (tr && tr.readyState === 2) onTrackLoad();
            else {
              // nếu chưa có metadata, chờ rồi bật track
              if (video.readyState < 1) {
                video.addEventListener("loadedmetadata", onTrackLoad, {
                  once: true,
                });
              }
            }
            setTimeout(() => onTrackLoad(), 50);
            setTimeout(() => onTrackLoad(), 250);
          }
        });
      } else {
        // Fallback
        video.src = src;
        plyr = new PlyrCtor(video, {
          captions: {
            active: true,
            language: preferExternal ? "vi" : "auto",
            update: true,
          },
          storage: { enabled: false },
        }) as Plyr;
        plyrRef.current = plyr;
        const containerSafari = (plyr as Plyr)?.elements?.container as
          | HTMLElement
          | undefined;
        setPlyrContainerEl(containerSafari ?? video.parentElement ?? null);
        if (preferExternal) {
          const tr = trackRef.current;
          if (tr && tr.readyState === 2) onTrackLoad();
          else {
            if (video.readyState >= 1) onTrackLoad();
            else
              video.addEventListener("loadedmetadata", onTrackLoad, {
                once: true,
              });
          }
          setTimeout(() => onTrackLoad(), 50);
          setTimeout(() => onTrackLoad(), 250);
        }
      }
    })().catch(() => {});

    return () => {
      mounted = false;
      hlsRef.current?.destroy();
      plyrRef.current?.destroy();
      hlsRef.current = null;
      plyrRef.current = null;
      setPlyrContainerEl(null);
    };
  }, [src, urlVtt]);

  // Xử lý sự kiện pause
  const handlePause = useCallback(() => {
    if (!onPause) return;
    const v = videoRef.current;
    if (!v) return;

    const now = Date.now();

    // 🚫 Nếu 2 lần pause cách nhau < 300ms → coi như double-tap gesture, bỏ qua
    if (now - lastPauseTsRef.current < 300) {
      lastPauseTsRef.current = now;
      pendingPauseReasonRef.current = null;
      return;
    }
    lastPauseTsRef.current = now;

    // ✅ Lấy reason "ép buộc" (quality-switch) nếu có
    const forcedNow = pauseReasonRef.current as
      | "quality-switch"
      | "user"
      | "unknown"
      | null;
    pauseReasonRef.current = null;
    if (forcedNow) pendingPauseReasonRef.current = forcedNow;

    if (pausePendingRef.current) return;
    pausePendingRef.current = true;

    pauseTimerRef.current = window.setTimeout(() => {
      pauseTimerRef.current = null;
      pausePendingRef.current = false;

      const withinSeekWindow =
        Date.now() - lastSeekTsRef.current < PAUSE_SEEK_GRACE;
      const forced = pendingPauseReasonRef.current;
      pendingPauseReasonRef.current = null;

      if (!forced && (seekingRef.current || withinSeekWindow)) return;

      pausedSinceRef.current = Date.now();
      lastPauseReasonCommittedRef.current = forced ?? "user";

      onPause({
        currentTime: v.currentTime,
        duration: Number.isFinite(v.duration) ? v.duration : 0,
        reason: forced ?? "user",
      });
    }, 80);
  }, [onPause]);

  const handleResume = useCallback(() => {
    const v = videoRef.current;
    if (!v || !onResume) return;

    // Nếu pause đang “pending” (chưa commit), huỷ pending luôn → coi như không có pause
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
      pausePendingRef.current = false;
      pendingPauseReasonRef.current = null;
      pausedSinceRef.current = null;
      lastPauseReasonCommittedRef.current = null;
      return;
    }

    const startedAt = pausedSinceRef.current;
    if (!startedAt) return; // chưa có pause commit trước đó → bỏ qua

    const pausedForMs = Math.round(Date.now() - startedAt);
    const reason = lastPauseReasonCommittedRef.current ?? "unknown";

    // reset mốc
    pausedSinceRef.current = null;
    lastPauseReasonCommittedRef.current = null;

    onResume({
      pausedForMs,
      reason,
      resumedAt: v.currentTime,
    });
  }, [onResume]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // dùng 'playing' để chắc chắn đã tiếp tục decode khung hình
    v.addEventListener("playing", handleResume);
    return () => v.removeEventListener("playing", handleResume);
  }, [handleResume]);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const fn = () => handlePause();
    v.addEventListener("pause", fn);
    return () => v.removeEventListener("pause", fn);
  }, [handlePause]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onSeeking = () => {
      seekingRef.current = true;
      lastSeekTsRef.current = Date.now();
    };
    const onSeeked = () => {
      lastSeekTsRef.current = Date.now();
      // thả cờ ở tick kế tiếp để cover trường hợp pause -> seeking
      setTimeout(() => {
        seekingRef.current = false;
      }, 0);
    };

    v.addEventListener("seeking", onSeeking);
    v.addEventListener("seeked", onSeeked);
    return () => {
      v.removeEventListener("seeking", onSeeking);
      v.removeEventListener("seeked", onSeeked);
    };
  }, []);

  // Đảm bảo lắng nghe sự kiện load/error trực tiếp trên phần tử <track>
  useEffect(() => {
    const tr = trackRef.current;
    if (!tr) return;

    const handleLoad = () => onTrackLoad();
    const handleError = () => onTrackError();

    // Nếu đã loaded trước đó
    if (tr.readyState === 2) {
      onTrackLoad();
    }

    tr.addEventListener("load", handleLoad);
    tr.addEventListener("error", handleError);

    return () => {
      tr.removeEventListener("load", handleLoad);
      tr.removeEventListener("error", handleError);
    };
  }, [urlVtt]);

  // Tải VTT thủ công -> tạo Blob URL để tránh CORS/cache không ổn định
  useEffect(() => {
    let aborted = false;
    async function loadVtt() {
      if (!urlVtt) {
        if (vttObjectUrlRef.current) {
          URL.revokeObjectURL(vttObjectUrlRef.current);
          vttObjectUrlRef.current = null;
        }
        setVttBlobUrl(null);
        return;
      }
      try {
        const res = await fetch(urlVtt, { cache: "no-store", mode: "cors" });
        if (!res.ok) throw new Error(`VTT fetch failed ${res.status}`);
        const text = await res.text();
        if (aborted) return;
        const blob = new Blob([text], { type: "text/vtt" });
        const bu = URL.createObjectURL(blob);
        if (vttObjectUrlRef.current) {
          URL.revokeObjectURL(vttObjectUrlRef.current);
        }
        vttObjectUrlRef.current = bu;
        setVttBlobUrl(bu);
      } catch {
        // fallback: dùng URL gốc, vẫn để event load xử lý
        setVttBlobUrl(null);
      }
    }
    loadVtt();
    return () => {
      aborted = true;
    };
  }, [urlVtt]);

  // Cleanup Blob URL khi unmount
  useEffect(() => {
    return () => {
      if (vttObjectUrlRef.current) {
        URL.revokeObjectURL(vttObjectUrlRef.current);
        vttObjectUrlRef.current = null;
      }
    };
  }, []);

  // Khi video đã có metadata/first frame, thử kích hoạt lại phụ đề (ổn định khi reload)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onMeta = () => onTrackLoad();
    const onData = () => onTrackLoad();
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", onData);
    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", onData);
    };
  }, [src, urlVtt]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdate = () => setCurrentTime(v.currentTime || 0);
    v.addEventListener("timeupdate", onTimeUpdate);
    return () => v.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className={`${styles.player} relative w-full`}>
        <video
          ref={videoRef}
          className="w-full bg-black"
          playsInline
          controls
          crossOrigin="anonymous"
          poster={poster}
          preload="metadata" // giúp track load sớm
        >
          {/* ✅ CHỈ DÙNG EXTERNAL VTT */}
          {urlVtt ? (
            <track
              ref={trackRef}
              key={`${vttBlobUrl ?? urlVtt}?b=${vttBuster}`} // remount khi đổi URL
              kind="captions" // dùng "captions" để Plyr nhận đúng
              src={
                vttBlobUrl ??
                `${urlVtt}${urlVtt.includes("?") ? "&" : "?"}b=${vttBuster}`
              }
              label="Tiếng Việt"
              srcLang="vi"
              default
              onLoad={onTrackLoad} // bật sau khi track đã load
              onError={onTrackError}
            />
          ) : null}
        </video>

        {switching && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 text-white rounded-lg">
            <div className="flex items-center gap-2">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />}
              />
              <span>Đang đổi chất lượng…</span>
            </div>
          </div>
        )}
        {/* ✅ Overlays theo thời gian */}
        {/* Nền mờ nếu có bất kỳ overlay nào bật backdrop (mặc định true) */}
        {plyrContainerEl &&
          activeOverlays.length > 0 &&
          createPortal(
            <>
              {/* (Tuỳ chọn) Nền mờ */}
              {activeOverlays.some((o) => o.backdrop !== false) && (
                <div
                  className="absolute inset-0 z-[65] bg-black/35 pointer-events-auto"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onWheel={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                />
              )}

              {/* 👇 Lớp mask luôn có để nuốt click ra ngoài nội dung */}
              <div
                className="absolute inset-0 z-[66] pointer-events-auto"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onWheel={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              />

              {/* 👇 Vùng đặt nội dung overlay (không chặn con) */}
              <div className="absolute inset-0 z-[70] pointer-events-none">
                {activeOverlays.map((ov, idx) => {
                  const key = String(ov.id ?? idx);
                  const node =
                    typeof ov.content === "function"
                      ? ov.content({
                          close: () => closeOverlay(key),
                          video: videoRef.current,
                        })
                      : ov.content;

                  return (
                    <div key={key} className={ov.className} style={ov.style}>
                      {/* Chỉ nội dung quiz mới nhận sự kiện */}
                      <div className="pointer-events-auto h-11/12">{node}</div>
                    </div>
                  );
                })}
              </div>
            </>,
            plyrContainerEl,
          )}
      </div>
    </div>
  );
}
