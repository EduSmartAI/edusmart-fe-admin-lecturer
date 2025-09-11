import { create } from "zustand";
import { useLoadingStore } from "../Loading/LoadingStore";
import { Province, Ward } from "EduSmart/api/api-province";
import { apiThirdClient } from "EduSmart/hooks/apiThirdClient";
import { FormInstance } from "antd/lib";

interface AddressThirdClientState {
  provinces: Province[];
  wards: Ward[];
  province: string;
  ward: string;
  fetchProvinces: () => Promise<void>;
  fetchWards: (provinceCode: string) => Promise<void>;
  submitAddressForm: (form: FormInstance) => void;
}

export const useAddressThirdClientStore = create<AddressThirdClientState>(
  (set) => ({
    provinces: [],
    wards: [],
    province: "",
    ward: "",
    fetchProvinces: async () => {
      const setLoading = useLoadingStore.getState().setLoading;
      setLoading(true);
      try {
        const list = await apiThirdClient.provinces.getAll();
        set({ provinces: list });
      } catch (error) {
        console.error("fetchProvinces error:", error);
      } finally {
        setLoading(false);
      }
    },
    fetchWards: async (province_code) => {
      const setLoading = useLoadingStore.getState().setLoading;
      setLoading(true);
      try {
        const list = await apiThirdClient.wards.getAll(province_code);
        set({ wards: list });
      } catch (error) {
        console.error("fetchWards error:", error);
      } finally {
        setLoading(false);
      }
    },
    submitAddressForm: (form) => {
      form
        .validateFields()
        .then((values) => {
          set({ province: values.province, ward: values.ward });
          console.log("🏷️ Store updated from form:", values);
          console.log("province", form.getFieldsValue().province);
        })
        .catch((err) => {
          console.warn("Validation failed:", err);
        });
    },
  }),
);
