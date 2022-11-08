import { useRef } from "react";
import { useMemo } from "react";
import { useImperativeHandle } from "react";
import FieldContext from "./FieldContext";
import useForm from "./useForm";

const Form = (props, ref) => {
  const {
    form,
    initialValues,
    children,
    onFinish,
    onReset,
    onValueChange,
  } = props;
  const [formInstance] = useForm(form);
  // 暴露 ref 属性
  useImperativeHandle(ref, () => formInstance);

  const { setCallbacks, setInitialValues } =
    formInstance.getInternalHooks();
  setCallbacks({ onValueChange, onFinish });

  const mounted = useRef(false);
  if (!mounted.current) {
    initialValues && setInitialValues(initialValues);
    mounted.current = true;
  }

  const fieldContextValue = useMemo(
    () => ({ ...formInstance }),
    [formInstance]
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formInstance.submit();
      }}
      onReset={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formInstance.resetFields();
        onReset && onReset(e);
      }}
    >
      <FieldContext.Provider value={fieldContextValue}>
        {children}
      </FieldContext.Provider>
    </form>
  );
};

export default Form;
