import { useRef } from "react";

class FormStore {
  constructor() {
    this.store = {};
    this.callbacks = Object.create(null);
    this.initialValues = {};
    this.fieldEntities = [];
  }
  // 通过 `useForm` 方法暴露出去的字段
  getForm = () => ({
    getFieldValue: this.getFieldValue,
    getFieldsValue: this.getFieldsValue,
    setFieldsValue: this.setFieldsValue,
    submit: this.submit,
    resetFields: this.resetFields,
    getInternalHooks: this.getInternalHooks,
  });

  getInternalHooks = () => ({
    updateValue: this.updateValue,
    setInitialValues: this.setInitialValues,
    setCallbacks: this.setCallbacks,
    initEntityValue: this.initEntityValue,
    registerField: this.registerField,
  });
  // 注册回调
  setCallbacks = (callbacks) => {
    this.callbacks = callbacks;
  };
  // 注册表单初始值
  setInitialValues = (initialValues) => {
    this.initialValues = initialValues ?? {};
    this.setFieldsValue(this.initialValues);
  };
  // 注册实例后，设置表单初始值
  initEntityValue = (entity) => {
    const name = entity.props.name;
    if (name) {
      const prevValue = this.store[name];
      if (!prevValue) {
        this.store = {
          ...this.store,
          [name]: this.initialValues[name],
        };
      }
    }
  };
  // 注册实例
  registerField = (entity) => {
    this.fieldEntities.push(entity);
    // 返回一个注销实例的回调
    return () => {
      this.fieldEntities = this.fieldEntities.filter(
        (item) => item !== entity
      );
    };
  };
  getFieldEntities = () => {
    return this.fieldEntities.filter((entity) => entity.props.name);
  };
  // 通知更新
  notifyObservers = (prevStore, nameList, info) => {
    // 将 store 放到 info 中
    // 下面再把 prevStore 一同传递给回调进行比较
    info.store = this.getFieldsValue();
    // 向每一个订阅的实例发布更新通知
    const entities = this.getFieldEntities();
    entities.forEach((entity) => {
      entity.onStoreChange(prevStore, nameList, info);
    });
  };

  getFieldValue = (name) => this.store[name];
  getFieldsValue = () => ({ ...this.store });
  setFieldsValue = (newStore) => {
    const prevStore = this.getFieldsValue();
    this.store = { ...this.store, ...newStore };
    // 通知更新
    this.notifyObservers(prevStore, undefined, { type: "EXTERNAL" });
  };

  updateValue = (name, newValue) => {
    if (!name) return;
    const prevStore = this.getFieldsValue();
    this.store = { ...this.store, [name]: newValue };
    this.notifyObservers(prevStore, [name], {
      type: "INTERNAL",
    });

    const { onValueChange } = this.callbacks;
    // 如果用户监听了 onValueChange 事件则在此触发
    onValueChange &&
      onValueChange(
        { [name]: this.store[name] },
        this.getFieldsValue()
      );
  };

  // form actions，提交、校验、重置等方法
  submit = () => {
    const { onFinish } = this.callbacks;
    onFinish && onFinish(this.store);
  };

  // 重置所有字段
  resetFields = (nameList) => {
    const prevStore = this.getFieldsValue();
    // nameList 为空时，重置所有字段
    if (!nameList) {
      this.store = { ...this.initialValues };
      this.resetWithFieldInitialValue();
      this.notifyObservers(prevStore, undefined, { type: "RESET" });
      return;
    }
    // nameList 不为空时，只更新指定字段
    nameList.forEach((name) => {
      this.store[name] = this.initialValues[name];
    });
    this.resetWithFieldInitialValue(nameList);
    this.notifyObservers(prevStore, nameList, { type: "RESET" });
  };

  // 这里需要为没有指定初始值的字段也注册
  resetWithFieldInitialValue = (nameList) => {
    const entities = this.getFieldEntities();
    if (!nameList) {
      entities.forEach((entity) => {
        const { name } = entity.props;
        const prevValue = this.store[name];
        if (!prevValue) {
          this.store = {
            ...this.store,
            [name]: this.initialValues[name],
          };
        }
      });
      return;
    }
    const requiredEntities = entities.filter((entity) =>
      nameList.includes(entity.props.name)
    );
    requiredEntities.forEach((entity) => {
      const { name } = entity.props;
      const prevValue = this.store[name];
      if (!prevValue) {
        this.store = {
          ...this.store,
          [name]: this.initialValues[name],
        };
      }
    });
  };
}

/**
 * 初始化表单
 */
const useForm = (form) => {
  const formRef = useRef();
  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      const formStore = new FormStore();
      formRef.current = formStore.getForm();
    }
  }
  return [formRef.current];
};
export default useForm;
