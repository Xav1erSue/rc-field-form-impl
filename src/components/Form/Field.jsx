import React from "react";
import { cloneElement, isValidElement } from "react";
import FieldContext from "./FieldContext";

// 需要将实例注册到 FormStore 中，因此使用类组件
class Field extends React.Component {
  mounted = false;
  // 仅用于触发 re-render
  state = {
    resetCount: 0,
  };
  constructor(props) {
    super(props);
    const { getInternalHooks } = props.fieldContext;
    const { initEntityValue } = getInternalHooks();
    initEntityValue(this);
  }

  componentDidMount() {
    const { getInternalHooks } = this.props.fieldContext;
    const { registerField } = getInternalHooks();
    registerField(this);
    this.mounted = true;
  }

  refresh = () => {
    this.setState(({ resetCount }) => {
      return { resetCount: resetCount + 1 };
    });
  };

  reRender = () => {
    if (!this.mounted) return;
    this.forceUpdate();
  };

  onStoreChange = (prevStore, namePathList, info) => {
    const { store } = info;
    const prevValue = prevStore[this.props.name];
    const curValue = store[this.props.name];
    // 判断通知涉及的字段是否是当前字段
    const nameMatch =
      namePathList && namePathList.includes(this.props.name);
    switch (info.type) {
      // RESET 事件，不需要判断字段是否匹配
      case "RESET":
        this.refresh();
        break;
      // 默认情况下，只有字段匹配，或是数据发生变化时才触发 re-render
      default:
        if (nameMatch && prevValue !== curValue) {
          this.reRender();
        }
    }
  };

  // 将子组件转为受控组件
  getControlled = (childProps) => {
    const {
      fieldContext,
      name,
      valuePropName = "value",
      trigger = "onChange",
    } = this.props;
    const { getFieldValue, getInternalHooks } = fieldContext;
    const { updateValue } = getInternalHooks();
    const value = name ? getFieldValue(name) : undefined;
    // 直接定义在子组件上的 trigger 函数
    const originTriggerFunc = childProps[trigger];
    return {
      ...childProps,
      [valuePropName]: value,
      [trigger]: (e) => {
        const newValue = e.target[valuePropName];
        updateValue(name, newValue);
        originTriggerFunc && originTriggerFunc(e);
      },
    };
  };
  render() {
    const { children } = this.props;
    const { resetCount } = this.state;
    // 如果 children 不是合法 React 元素，不封装受控
    if (!isValidElement(children))
      return (
        <React.Fragment key={resetCount}>{children}</React.Fragment>
      );
    return (
      <React.Fragment key={resetCount}>
        {cloneElement(children, this.getControlled(children.props))}
      </React.Fragment>
    );
  }
}

const WrapperField = (props) => {
  const fieldContext = React.useContext(FieldContext);
  return (
    <div style={{ display: "flex", marginBottom: 12 }}>
      {props.label && <div style={{ width: 100 }}>{props.label}</div>}
      <Field {...props} fieldContext={fieldContext} />
      {props.error ? (
        <div style={{ marginLeft: 12 }}>{props.error.message}</div>
      ) : props.extra ? (
        <div style={{ marginLeft: 12 }}>{props.extra}</div>
      ) : null}
    </div>
  );
};

export default WrapperField;
