// File: components/ReusableDropdown.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import type { SelectProps } from "antd";
import BaseControlFormSelectInput from "../BaseControl/BaseControlFormSelectInput";
import { XmlColumn } from "EduSmart/utils/xmlColumn";
import { useAddressThirdClientStore } from "EduSmart/stores/Address/addressThirdClientStore";
import useFormInstance from "antd/es/form/hooks/useFormInstance";

interface UserControlSelectAddressProps {
  xmlProvinceColumn: XmlColumn;
  xmlWardColumn: XmlColumn;
  defaultValueProvice?: string;
  defaultValueWard?: string;
  size?: SelectProps["size"];
  style?: React.CSSProperties;
  isSearch?: boolean;
  classNameProvince?: string;
  classNameWard?: string;
}

const UserControlSelectAddress: React.FC<UserControlSelectAddressProps> = ({
  xmlProvinceColumn,
  xmlWardColumn,
  defaultValueProvice = "Tỉnh/Thành phố",
  defaultValueWard = "Phường/Xã",
  size = "middle",
  style = {},
  isSearch = false,
  classNameProvince = "",
  classNameWard = "",
}) => {
  const fetchProvinces = useAddressThirdClientStore((s) => s.fetchProvinces);
  const fetchWards = useAddressThirdClientStore((s) => s.fetchWards);
  const provinces = useAddressThirdClientStore((s) => s.provinces);
  const wards = useAddressThirdClientStore((s) => s.wards);
  const [selectedProvince, setSelectedProvince] = useState<string>();
  const [selectedWard, setSelectedWard] = useState<string>();
  const [mounted, setMounted] = useState(false);
  const didFetchProvinces = useRef(false);
  const didFetchWards = useRef(false);
  const form = useFormInstance();

  const handleProvinceChange = (provinceCode: string) => {
    if (provinceCode !== selectedProvince) {
      setSelectedProvince(provinceCode);
      setSelectedWard(undefined);
      fetchWards(provinceCode);
      form.resetFields([xmlWardColumn.id]);
    }
  };
  const handleWardChange = (wardCode: string) => {
    setSelectedWard(wardCode);
  };

  const provinceOptions = Array.from(
    new Map(
      provinces.map((p) => [
        p.province_code,
        { label: p.name, value: p.province_code },
      ]),
    ).values(),
  );

  const wardOptions = Array.from(
    new Map(
      wards.map((w) => [
        w.ward_code,
        { label: w.ward_name, value: w.ward_code },
      ]),
    ).values(),
  );

  useEffect(() => {
    if (!didFetchProvinces.current) {
      didFetchProvinces.current = true;
      fetchProvinces();
    }
  }, [fetchProvinces]);

  useEffect(() => {
    const prov = form.getFieldValue(xmlProvinceColumn.id);
    if (prov && !didFetchWards.current) {
      didFetchWards.current = true;
      setSelectedProvince(prov);
      fetchWards(prov);
    }
  }, [form, xmlProvinceColumn.id, fetchWards]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <div>
      <div className="my-4">
        <BaseControlFormSelectInput
          className={classNameProvince}
          xmlColumn={xmlProvinceColumn}
          isSearch={isSearch}
          options={provinceOptions}
          defaultValue={defaultValueProvice}
          onChange={handleProvinceChange}
          size={size}
          style={style}
        />
      </div>
      <div>
        <BaseControlFormSelectInput
          className={classNameWard}
          key={selectedProvince || "no-province"}
          xmlColumn={xmlWardColumn}
          isSearch={isSearch}
          options={wardOptions}
          value={selectedWard}
          defaultValue={defaultValueWard}
          onChange={handleWardChange}
          size={size}
          style={style}
          disabled={!selectedProvince}
        />
      </div>
    </div>
  );
};

export default UserControlSelectAddress;
