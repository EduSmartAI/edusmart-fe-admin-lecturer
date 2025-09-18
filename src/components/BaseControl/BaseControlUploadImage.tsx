"use client";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import ImgCrop from "antd-img-crop";
import {
  Upload,
  Image as AntdImage,
  Form,
  Modal,
  Slider,
  UploadFile,
  UploadProps,
} from "antd";
import type { GetProp } from "antd";
import type { Rule } from "antd/lib/form";
import type { Area } from "react-easy-crop";
import type { RcFile } from "antd/es/upload/interface";
import Cropper from "react-easy-crop";
import { XmlColumn } from "EduSmart/utils/xmlColumn";
import { buildRules } from "EduSmart/utils/antValidation";
import "@ant-design/v5-patch-for-react-19";
import {
  getBase64,
  getCroppedImg,
  urlToBase64,
} from "EduSmart/utils/commonFunction";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { courseServiceAPI } from "EduSmart/api/api-course-service";

export type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export interface ImageCropUploadProps {
  xmlColumn: XmlColumn;
  maxCount?: number;
  uploadAction?: string;
  initialFileList?: UploadFile[];
  accept?: string;
  showGrid?: boolean;
  rotationSlider?: boolean;
  aspectSlider?: boolean;
  showReset?: boolean;
  isShowOnNewTab?: boolean;
  isShowEdit?: boolean;
  disabled?: boolean;
  allowedExtensions?: string[];
  onChange?: (fileList: UploadFile[]) => void;
  onPreview?: (file: UploadFile) => Promise<void>;
}

const BaseControlUploadImage: React.FC<ImageCropUploadProps> = ({
  xmlColumn,
  maxCount = 3,
  uploadAction,
  initialFileList = [],
  accept = "image/*",
  showGrid = true,
  rotationSlider = false,
  aspectSlider = false,
  showReset = false,
  isShowOnNewTab = false,
  isShowEdit = false,
  disabled = false,
  allowedExtensions = [],
  onChange,
  onPreview,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([...initialFileList]);
  const form = Form.useFormInstance();
  const [editingFile, setEditingFile] = useState<UploadFile | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);
  const messageApi = useNotification();

  // 1) Enhanced showEditModal: convert external URL → base64 before editing
  const showEditModal = async (file: UploadFile) => {
    let target = file;
    if (!file.originFileObj && file.url?.startsWith("http")) {
      try {
        const dataUrl = await urlToBase64(file.url);
        const newFile = { ...file, url: dataUrl, thumbUrl: dataUrl };
        const newList = fileList.map((f) =>
          f.uid === newFile.uid ? newFile : f,
        );
        setFileList(newList);
        onChange?.(newList);
        form.setFieldsValue({
          [xmlColumn.id]: newList.map((f) => ({ baseUrl: f.url! })),
        });
        target = newFile;
      } catch (err) {
        console.warn("Convert URL to base64 failed:", err);
      }
    }
    setEditingFile(target);
  };

  // Memoize initialFileList to prevent infinite loops when parent recreates the array
  const memoizedInitialFileList = useMemo(() => initialFileList, [
    initialFileList.length,
    initialFileList.map(f => f.uid).join(','),
    initialFileList.map(f => f.url).join(',')
  ]);

  useEffect(() => {
    setFileList([...memoizedInitialFileList]);
  }, [memoizedInitialFileList]);

  const handleEditOk = async () => {
    if (!editingFile || !croppedAreaPixels) {
      setEditingFile(null);
      return;
    }
    const src = editingFile.url!;
    const croppedDataUrl = await getCroppedImg(src, croppedAreaPixels);
    const blob = await (await fetch(croppedDataUrl)).blob();
    const fileBlob = new File([blob], editingFile.name, {
      type: blob.type,
      lastModified: Date.now(),
    });
    const croppedFile = Object.assign(fileBlob, {
      uid: editingFile.uid,
    }) as RcFile;
    const newFile: UploadFile = {
      ...editingFile,
      thumbUrl: croppedDataUrl,
      url: croppedDataUrl,
      originFileObj: croppedFile,
      status: "done",
    };
    const newList = fileList.map((f) =>
      f.uid === editingFile.uid ? newFile : f,
    );
    setFileList(newList);
    onChange?.(newList);
    form.setFieldsValue({
      [xmlColumn.id]: newList.map((f) => ({ baseUrl: f.url! })),
    });
    setEditingFile(null);
  };

  const handleEditCancel = () => setEditingFile(null);

  const renderUploadItem: UploadProps["itemRender"] = (originNode, file) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {originNode}
      {!disabled && isShowEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            showEditModal(file);
          }}
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            zIndex: 999,
            pointerEvents: "auto",
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          Edit
        </button>
      )}
    </div>
  );

  const handleChange: UploadProps["onChange"] = async (info) => {
    const rawList = info.fileList;
    const newList = await Promise.all(
      rawList.map(async (file) => {
        if (!file.thumbUrl && !file.url && file.originFileObj) {
          const preview = await getBase64(file.originFileObj as FileType);
          return { ...file, thumbUrl: preview, url: preview };
        }
        return { ...file, url: file.thumbUrl ?? file.url! };
      }),
    );
    setFileList(newList);
    onChange?.(newList);
    form.setFieldsValue({
      [xmlColumn.id]: newList.map((f) => ({ baseUrl: f.url! })),
    });
  };

  // Use customRequest to upload to server and replace local URL with hosted URL
  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      console.log('[ImageUpload] Starting upload for:', (file as File).name);
      const hostedUrl = await courseServiceAPI.uploadImage(file as File);
      console.log('[ImageUpload] Got hosted URL:', hostedUrl);
      
      // Create new file entry with hosted URL
      const newFile: UploadFile = {
        uid: (file as any).uid || String(Date.now()),
        name: (file as File).name,
        status: 'done',
        url: hostedUrl,
        thumbUrl: hostedUrl,
        originFileObj: file as any,
      };
      
      // Replace the current fileList with the new file (for single file upload)
      const nextList = maxCount === 1 ? [newFile] : [...fileList, newFile];
      setFileList(nextList);
      onChange?.(nextList);
      form.setFieldsValue({
        [xmlColumn.id]: nextList.map((f) => ({ baseUrl: f.url! })),
      });
      onSuccess && onSuccess('ok');
      messageApi.success('Tải ảnh thành công');
    } catch (e) {
      console.error('[ImageUpload] Upload failed:', e);
      messageApi.error('Tải ảnh thất bại');
      onError && onError(e as any);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      [xmlColumn.id]: memoizedInitialFileList.map((file) => ({
        baseUrl: file.url!,
      })),
    });
  }, [form, memoizedInitialFileList, xmlColumn.id]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const defaultPreviewNewTab = async (file: UploadFile) => {
    const src =
      file.url! ||
      (file.originFileObj
        ? await getBase64(file.originFileObj as FileType)
        : "");
    const w = window.open("");
    if (w) w.document.write(`<img src="${src}" style="max-width:100%;" />`);
    else window.location.href = src;
  };

  const handlePreviewModal = async (file: UploadFile) => {
    const src =
      file.url! ||
      (file.originFileObj
        ? await getBase64(file.originFileObj as FileType)
        : "");
    if (src) {
      setPreviewImage(src);
      setPreviewOpen(true);
    }
  };

  const beforeUpload = (file: RcFile) => {
    if (allowedExtensions.length > 0) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const whiteList = allowedExtensions.map((e) => e.toLowerCase());
      if (!whiteList.includes(ext)) {
        messageApi.error(`Chỉ cho phép các định dạng: ${whiteList.join(", ")}`);
        // LIST_IGNORE sẽ ngăn file này được thêm vào danh sách
        return Upload.LIST_IGNORE;
      }
    }
    return true; // cho phép upload tiếp
  };

  const previewHandler = isShowOnNewTab
    ? (onPreview ?? defaultPreviewNewTab)
    : handlePreviewModal;

  const fieldId = useMemo(() => xmlColumn.id, [xmlColumn.id]);
  const rulesList = useMemo<Rule[]>(() => buildRules(xmlColumn), [xmlColumn]);

  return (
    <>
      <Form.Item
        name={xmlColumn.id}
        label={xmlColumn.name}
        rules={rulesList}
        validateTrigger="onBlur"
        valuePropName="fileList"
        getValueFromEvent={({ fileList }) => fileList}
        style={{ marginBottom: 0 }}
      >
        {/** Khi không disabled: cho phép upload + edit */}
        {!disabled ? (
          <ImgCrop
            showGrid={showGrid}
            rotationSlider={rotationSlider}
            aspectSlider={aspectSlider}
            showReset={showReset}
          >
            <Upload
              disabled={disabled}
              id={fieldId}
              action={uploadAction}
              listType="picture-card"
              beforeUpload={beforeUpload}
              accept={accept}
              fileList={fileList}
              onChange={handleChange}
              customRequest={customRequest}
              onPreview={previewHandler}
              maxCount={maxCount}
              itemRender={renderUploadItem}
              showUploadList={{
                showRemoveIcon: !disabled,
                showPreviewIcon: true,
                showDownloadIcon: !disabled,
              }}
            >
              {fileList.length < maxCount && <div>+ Upload</div>}
            </Upload>
          </ImgCrop>
        ) : (
          /** Khi disabled: chỉ hiển thị gallery ảnh để xem */
          <AntdImage.PreviewGroup>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {fileList.map((file) => (
                <AntdImage
                  key={file.uid}
                  width={100}
                  src={file.url || file.thumbUrl}
                  preview={{ mask: <></> }}
                  style={{ border: "1px solid #f0f0f0", borderRadius: 4 }}
                />
              ))}
            </div>
          </AntdImage.PreviewGroup>
        )}

        {/** Modal preview vẫn giữ nguyên */}
        <AntdImage
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            src: previewImage,
            onVisibleChange: (vis) => setPreviewOpen(vis),
          }}
          alt=""
        />
      </Form.Item>

      <Modal
        open={!!editingFile}
        title="Edit Image"
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        width={520}
      >
        {editingFile && (
          <>
            <div style={{ position: "relative", width: "100%", height: 400 }}>
              <Cropper
                image={editingFile.url!}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={showGrid}
              />
            </div>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={setZoom}
              style={{ marginTop: 16 }}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default BaseControlUploadImage;
