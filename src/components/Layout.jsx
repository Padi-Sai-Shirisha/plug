import { Button, Layout } from "antd";
import { googleLogin, anonymousLogin } from "../config/firebase";

const { Header, Footer, Content } = Layout;

const LayoutComp = ({ children }) => (
  <>
    <Layout title="This is the most of the things">
      <Header>
        <Button
          type="primary"
          onClick={() => {
            console.log("googleLogin");
            googleLogin();
          }}
        >
          Login With Google
        </Button>
        <span style={{ margin: "0 10px" }}></span>
        <Button
          type="primary"
          onClick={() => {
            anonymousLogin();
          }}
        >
          Login Anonymously
        </Button>
      </Header>
      <Content>{children}</Content>
      <Footer>Footer</Footer>
    </Layout>
  </>
);

export default LayoutComp;
