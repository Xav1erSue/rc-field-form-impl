import Form from "./Form";
import Field from "./Field";
import useForm from "./useForm";
import { forwardRef } from "react";

const InternalForm = forwardRef(Form);

const RefForm = InternalForm;
RefForm.Item = Field;
RefForm.useForm = useForm;

export { Field as Item };
export default RefForm;
