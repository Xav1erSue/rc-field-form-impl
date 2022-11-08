import Form from "./components/Form";

function App() {
  const onFinish = (values) => {
    console.log("Submit", values);
  };
  const [form] = Form.useForm();

  const reset = () => {
    form.resetFields(["username"]);
  };

  return (
    <>
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={{
          username: "user123",
          isAdmin: false,
        }}
      >
        <Form.Item name="username" label="username">
          <input />
        </Form.Item>

        <Form.Item name="gender" label="gender">
          <select>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="secret">secret</option>
          </select>
        </Form.Item>

        <Form.Item
          label="isAdmin"
          name="isAdmin"
          valuePropName="checked"
        >
          <input type="checkbox" />
        </Form.Item>

        <Form.Item>
          <button htmltype="submit" style={{ marginRight: "10px" }}>
            Submit
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </Form.Item>
      </Form>
    </>
  );
}

export default App;
