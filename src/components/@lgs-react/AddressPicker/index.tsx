/*
使用示例：
<AddressPicker
	visible={true}
	onFetch={async (code: string) => {
		return [{ code: "1", name: "四川省" }];
	}}
	onSure={async (data: AddressPickerDataProps) => {
		console.log(data);
	}}
	onClose={() => {}}
/>
*/

import clsx from "clsx";
import { memo, useEffect, useRef, useState } from "react";
import Loading2 from "../Loading2";
import "./index.less";

/**
 * 数据模型
 */
export interface AddressPickerModelProps {
  code: string;
  name: string;
}

/**
 * 省市区数据模型
 */
export interface AddressPickerDataProps {
  province: AddressPickerModelProps;
  city: AddressPickerModelProps;
  area: AddressPickerModelProps;
}

type KeyType = keyof AddressPickerDataProps;

interface IProps {
  visible: boolean /** 是否显示 */;
  data?: AddressPickerDataProps | null /** 默认值 */;
  themeColor?: string;
  onFetch: (code: string) => Promise<any> /** 匹配数据源 */;
  onSure: (data: AddressPickerDataProps) => void /** 确认 */;
  onClose: () => void /** 关闭 */;
}

export default memo(function AddressPicker({ visible, data, themeColor = "#49C265", onFetch, onSure, onClose }: IProps) {
  // refs
  const itemsWrapRef = useRef<HTMLDivElement | null>(null);

  // state
  const [selectedKey, setSelectedKey] = useState<KeyType>("province");
  const [items, setItems] = useState<AddressPickerModelProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(!data);
  const [innerData, setInnerData] = useState<AddressPickerDataProps>(
    () =>
      data || {
        province: { code: "", name: "" },
        city: { code: "", name: "" },
        area: { code: "", name: "" },
      }
  );

  // methods
  /** 获取数据 */
  const getData = (code: string) => {
    setLoading(true);
    onFetch(code).then((_items: AddressPickerModelProps[]) => {
      setItems(_items);
      setLoading(false);
      if (itemsWrapRef.current) {
        itemsWrapRef.current.scrollTop = 0;
      }
    });
  };

  // events
  /** 点击类目 */
  const onTap = (key: KeyType) => {
    setDisabled(true);
    setSelectedKey(key);
    setItems([]);
    let code = "";
    if (key === "province") {
      setInnerData({
        province: { code: "", name: "" },
        city: { code: "", name: "" },
        area: { code: "", name: "" },
      });
    } else if (key === "city") {
      code = innerData.province.code;
      setInnerData((prev) => ({
        ...prev,
        city: { code: "", name: "" },
        area: { code: "", name: "" },
      }));
    } else if (key === "area") {
      code = innerData.city.code;
      setInnerData((prev) => ({
        ...prev,
        area: { code: "", name: "" },
      }));
    }
    getData(code);
  };
  /** 点击列表 */
  const onItemTap = (item: AddressPickerModelProps) => {
    setDisabled(true);
    setInnerData((prev) => ({
      ...prev,
      [selectedKey]: { ...item },
    }));
    // 处理key值
    if (selectedKey === "province") {
      setSelectedKey("city");
      getData(item.code);
    } else if (selectedKey === "city") {
      setSelectedKey("area");
      getData(item.code);
    } else if (selectedKey === "area") {
      setDisabled(false);
    }
    setItems([]);
  };
  const onInnerSure = () => {
    if (!disabled) {
      onSure({
        province: { ...innerData.province },
        city: { ...innerData.city },
        area: { ...innerData.area },
      });
      onClose();
    }
  };
  // effects
  /** 请求数据 */
  useEffect(() => {
    if (!innerData.province.code) {
      getData("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /** 阻止显示时页面可拖拽 */
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "scroll";
  }, [visible]);

  // render
  return (
    <div className={clsx(["lg-address-picker", { visible: !!visible }])}>
      <div className="lg-address-picker__contents">
        {/* 标题 */}
        <h3 className="lg-address-picker__title">已选择</h3>
        {/* 选择结果 */}
        <div className="lg-address-picker__res">
          {/* 省 */}
          <section
            className={clsx(["lg-address-picker__res_item", { selected: !!innerData.province.code }])}
            style={{
              // @ts-ignore
              "--theme-color": themeColor,
            }}
            onClick={() => {
              onTap("province");
            }}
          >
            {innerData.province.name || "选择省份"}
          </section>
          {/* 市 */}
          {innerData.province.name && (
            <section
              className={clsx(["lg-address-picker__res_item", { selected: !!innerData.city.code }])}
              style={{
                // @ts-ignore
                "--theme-color": themeColor,
              }}
              onClick={() => {
                onTap("city");
              }}
            >
              {innerData.city.name || "选择城市"}
            </section>
          )}
          {/* 区 */}
          {innerData.province.name && innerData.city.name && (
            <section
              className={clsx(["lg-address-picker__res_item", { selected: !!innerData.area.code }])}
              style={{
                // @ts-ignore
                "--theme-color": themeColor,
              }}
              onClick={() => {
                onTap("area");
              }}
            >
              {innerData.area.name || "选择城市"}
            </section>
          )}
        </div>
        {/* 选择项 */}
        <div className="lg-address-picker__list" ref={itemsWrapRef}>
          <>
            {/* 数据 */}
            {items?.map((item, i) => (
              <section
                className="lg-address-picker__list_item"
                key={`lg-address-picker__choose_${i}`}
                onClick={() => {
                  onItemTap(item);
                }}
              >
                {item.name}
              </section>
            ))}
            {/* loading */}
            {loading && <Loading2 />}
          </>
        </div>
        {/* 确认按钮 */}
        <div className={clsx(["lg-address-picker__button", { disabled: disabled }])} onClick={onInnerSure}>
          确认
        </div>
        {/* 关闭按钮 */}
        <div className="lg-address-picker__close_btn" onClick={onClose} />
      </div>
    </div>
  );
});
